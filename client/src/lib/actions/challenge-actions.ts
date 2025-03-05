// @/lib/actions/challenge-actions

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runCodeInDocker } from './codeExecution';

const prisma = new PrismaClient();

// Validation schema for code submission
const SubmissionSchema = z.object({
    challengeId: z.string(),
    userId: z.string(),
    code: z.string().min(1, 'Code cannot be empty'),
    languageId: z.string(),
});

export async function submitChallengeSolution(formData: z.infer<typeof SubmissionSchema>) {
    try {
        // Validate input
        const validatedData = SubmissionSchema.parse(formData);

        // Fetch test cases for the challenge
        const testCases = await prisma.testCase.findMany({
            where: { challengeId: validatedData.challengeId },
            select: { input: true, output: true },
        });

        if (!testCases.length) {
            throw new Error('No test cases found for this challenge');
        }

        // Execute code against test cases in a secure environment
        const executionResult = await runCodeInDocker(
            validatedData.code,
            validatedData.languageId,
            testCases
        );

        // Save submission to the database
        const submission = await prisma.submission.create({
            data: {
                ...validatedData,
                status: executionResult.status,
                runtime: executionResult.runtime,
                memory: executionResult.memory,
                testResults: executionResult.results,
                createdAt: new Date(),
            },
        });

        // Revalidate the challenge page to reflect new submission
        revalidatePath(`/challenge/${validatedData.challengeId}`);

        return {
            success: true,
            submissionId: submission.id,
            message: 'Submission received successfully',
            status: executionResult.status,
        };
    } catch (error) {
        console.error('Error submitting solution:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Submission failed',
        };
    } finally {
        await prisma.$disconnect();
    }
}

export async function runCodeLocally(formData: {
    challengeId: string;
    code: string;
    languageId: string;
}) {
    try {
        // Fetch visible test cases for the challenge
        const visibleTestCases = await prisma.testCase.findMany({
            where: { challengeId: formData.challengeId, isHidden: false },
            select: { input: true, output: true },
        });

        if (!visibleTestCases.length) {
            throw new Error('No visible test cases found for this challenge');
        }

        // Execute code against visible test cases in a secure environment
        const executionResult = await runCodeInDocker(
            formData.code,
            formData.languageId,
            visibleTestCases
        );

        return {
            success: true,
            testResults: executionResult.results,
            runtime: executionResult.runtime,
            memory: executionResult.memory,
        };
    } catch (error) {
        console.error('Error running code:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Code execution failed',
        };
    }
}