import { type NextRequest, NextResponse } from "next/server"
import { executeCode } from "@/lib/docker-utils"
import prisma from "@/lib/prisma"
import type { SubmissionStatus } from "@prisma/client"
import { updateUserRanks } from "@/lib/services/updateRanks"

export async function POST(req: NextRequest) {
  try {
    const { code, language, challengeId, testCaseId, isSubmission, userId } = await req.json()

    if (!code || !language || !challengeId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get challenge with test cases
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        testCases: testCaseId ? { where: { id: testCaseId } } : true,
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    if (challenge.testCases.length === 0) {
      return NextResponse.json({ error: "No test cases found for this challenge" }, { status: 400 })
    }

    // Prepare test cases for execution
    const testCases = challenge.testCases.map(tc => ({
      input: tc.input,
      output: tc.output,
      id: tc.id
    }))

    // Execute code with improved flow
    const executionResult = await executeCode(
      code,
      language,
      testCases,
      challenge.timeLimit,
      challenge.memoryLimit,
      Boolean(isSubmission)
    )

    if (!executionResult.success) {
      return NextResponse.json({
        error: "Code execution failed",
        message: executionResult.errorMessage || executionResult.compilationError,
        compilationError: executionResult.compilationError
      }, { status: 400 })
    }

    // Format test results for response
    const formattedTestResults = executionResult.testResults.map(result => ({
      input: result.input,
      expectedOutput: result.expectedOutput,
      actualOutput: result.actualOutput,
      passed: result.passed,
      runtime: result.runtime,
      memory: result.memory,
      error: result.error,
      errorType: result.errorType
    }))

    // Handle submission saving
    if (isSubmission && userId) {
      let status: SubmissionStatus = "ACCEPTED"
      
      // Determine submission status based on results
      if (!executionResult.allPassed) {
        const hasCompilationError = executionResult.testResults.some(r => r.errorType === "COMPILATION_ERROR")
        const hasRuntimeError = executionResult.testResults.some(r => r.errorType === "RUNTIME_ERROR")
        const hasTimeLimit = executionResult.testResults.some(r => r.errorType === "TIME_LIMIT_EXCEEDED")
        const hasMemoryLimit = executionResult.testResults.some(r => r.errorType === "MEMORY_LIMIT_EXCEEDED")
        
        if (hasCompilationError) {
          status = "COMPILATION_ERROR"
        } else if (hasTimeLimit) {
          status = "TIME_LIMIT_EXCEEDED"
        } else if (hasMemoryLimit) {
          status = "MEMORY_LIMIT_EXCEEDED"
        } else if (hasRuntimeError) {
          status = "RUNTIME_ERROR"
        } else {
          status = "WRONG_ANSWER"
        }
      }

      // Find language in database
      const language_db = await prisma.language.findFirst({
        where: { name: { equals: language, mode: "insensitive" } },
      })

      if (!language_db) {
        return NextResponse.json({ error: `Language not found: ${language}` }, { status: 400 })
      }

      // Calculate score based on passed test cases
      const passedTests = executionResult.testResults.filter(r => r.passed).length
      const totalTests = executionResult.testResults.length
      const score = Math.round((passedTests / totalTests) * 100)

      // Create submission record
      await prisma.submission.create({
        data: {
          user: { connect: { id: userId } },
          challenge: { connect: { id: challengeId } },
          language: { connect: { id: language_db.id } },
          code,
          status,
          runtime: executionResult.avgRuntime,
          memory: executionResult.maxMemory,
          testResults: formattedTestResults,
        },
      })

      // Handle successful submission
      if (executionResult.allPassed) {
        const existingAttempt = await prisma.challengeAttempt.findFirst({
          where: {
            userId: userId,
            challengeId: challengeId,
            successful: true,
          },
        })

        if (!existingAttempt) {
          // Mark challenge as completed
          await prisma.challengeAttempt.create({
            data: {
              user: { connect: { id: userId } },
              challenge: { connect: { id: challengeId } },
              completedAt: new Date(),
              successful: true,
            },
          })

          // Update user profile with points
          await prisma.userProfile.update({
            where: { userId },
            data: {
              points: { increment: challenge.points },
              solved: { increment: 1 },
            },
          })

          // Create activity log
          await prisma.activity.create({
            data: {
              userId,
              type: "CHALLENGE",
              name: challenge.title,
              result: "COMPLETED",
              points: challenge.points,
              time: `${executionResult.avgRuntime}ms`,
            },
          })

          // Update ranks for all users
          await updateUserRanks()
        }
      }
    } else if (userId && !isSubmission) {
      // Track attempt for non-submission runs
      const existingAttempt = await prisma.challengeAttempt.findFirst({
        where: {
          userId,
          challengeId,
          successful: null,
        },
      })

      if (!existingAttempt) {
        await prisma.challengeAttempt.create({
          data: {
            user: { connect: { id: userId } },
            challenge: { connect: { id: challengeId } },
          },
        })
      }
    }

    // Return execution results
    return NextResponse.json({
      success: true,
      testResults: formattedTestResults,
      allPassed: executionResult.allPassed,
      runtime: executionResult.avgRuntime,
      memory: executionResult.maxMemory,
      totalTests: executionResult.testResults.length,
      passedTests: executionResult.testResults.filter(r => r.passed).length,
      compilationError: executionResult.compilationError
    })

  } catch (err) {
    console.error("Execution error:", err)
    return NextResponse.json({ 
      error: "Failed to execute code", 
      message: String(err),
      details: err instanceof Error ? err.stack : undefined
    }, { status: 500 })
  }
}