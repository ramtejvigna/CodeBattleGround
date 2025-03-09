import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if(!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { code, language, challengeId } = await req.json();

        if(!code || !language || !challengeId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if(!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Execute the code against all test cases
        const executeResponse = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                code,
                language,
                challengeId,
                isSubmission: true,
                userId: user.id,
            }),
        });

        const executeResult = await executeResponse.json();

        if(!executeResponse.ok) {
            return NextResponse.json(
                { error: executeResult.error || 'Execution failed' },
                { status: executeResponse.status }
            );
        }

        return NextResponse.json(executeResult);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process submission' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if(!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const challengeId = searchParams.get('challengeId');
        const userId = session.user.id;

        let userIdToQuery = userId;
        if (!userIdToQuery) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { id: true },
            })

            if(!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 } 
                )
            };
            
            userIdToQuery = user.id;
        }

        const query: any = { where: { userId: userIdToQuery }};

        if(challengeId) {
            query.where.challengeId = challengeId;
        }

        const submissions = await prisma.submission.findMany({
            ...query,
            orderBy: { createdAt: 'desc' },
            include: {
                language: true,
                challenge: {
                    select: {
                        title: true,
                        difficulty: true
                    }
                }
            }
        });

        return NextResponse.json({ submissions });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}