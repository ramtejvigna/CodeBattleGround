import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const challengeId = params.id;

        if (!challengeId) {
            return NextResponse.json(
                { error: 'Challenge ID is required' },
                { status: 400 }
            );
        }

        // Get user from session
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch submissions for this user and challenge
        const submissions = await prisma.submission.findMany({
            where: {
                userId: user.id,
                challengeId: challengeId
            },
            orderBy: { createdAt: 'desc' },
            include: {
                language: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({ submissions });

    } catch (error) {
        console.error('Error fetching challenge submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
} 