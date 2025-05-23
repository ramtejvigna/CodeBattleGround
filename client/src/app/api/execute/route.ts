import { type NextRequest, NextResponse } from "next/server"
import { executeCodeInDocker } from "@/lib/docker-utils"
import prisma from "@/lib/prisma"
import type { SubmissionStatus } from "@prisma/client"
import { updateUserRanks } from "@/lib/services/updateRanks"

export async function POST(req: NextRequest) {
  try {
    const { code, language, challengeId, testCaseId, isSubmission, userId } = await req.json()

    if (!code || !language || !challengeId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        testCases: testCaseId ? { where: { id: testCaseId } } : true,
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const testResults = []
    let allPassed = true
    let totalRuntime = 0
    let maxMemory = 0

    // Process each test case
    for (const testCase of challenge.testCases) {
      // Execute the code in a Docker container
      const result = await executeCodeInDocker(
        code,
        language,
        testCase.input,
        testCase.output,
        challenge.timeLimit,
        challenge.memoryLimit,
      )

      testResults.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.output,
        passed: result.passed,
        runtime: result.runtime,
        memory: result.memory,
      })

      totalRuntime += result.runtime
      maxMemory = Math.max(maxMemory, result.memory)

      if (!result.passed) allPassed = false
    }

    // If this is a submission, save the results
    if (isSubmission && userId) {
      const status: SubmissionStatus = allPassed ? "ACCEPTED" : "WRONG_ANSWER"

      const language_db = await prisma.language.findFirst({
        where: { name: { equals: language, mode: "insensitive" } },
      })

      if (!language_db) {
        return NextResponse.json({ error: `Language not found: ${language}` }, { status: 400 })
      }

      await prisma.submission.create({
        data: {
          user: { connect: { id: userId } },
          challenge: { connect: { id: challengeId } },
          language: { connect: { id: language_db.id } },
          code,
          status,
          runtime: Math.round(totalRuntime / challenge.testCases.length),
          memory: maxMemory,
          testResults: testResults,
        },
      })

      if (allPassed) {
        const existingAttempt = await prisma.challengeAttempt.findFirst({
          where: {
            userId: userId,
            challengeId: challengeId,
            successful: true,
          },
        })

        if (!existingAttempt) {
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
              time: `${Math.round(totalRuntime / challenge.testCases.length)}ms`,
            },
          })

          // Update ranks for all users
          await updateUserRanks();
        }
      }
    } else if (userId) {
      // Added check for userId to avoid creating attempts for anonymous users
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

    return NextResponse.json({
      success: true,
      testResults,
      allPassed,
      runtime: Math.round(totalRuntime / challenge.testCases.length),
      memory: maxMemory,
    })
  } catch (err) {
    console.error("Execution error:", err)
    return NextResponse.json({ error: "Failed to execute code", message: String(err) }, { status: 500 })
  }
}