import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: NextRequest
) {
    try {
        const challengeId = req.nextUrl.searchParams.get('id');

        if (!challengeId) {
            return NextResponse.json(
                { error: 'Challenge ID is required' },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

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

        const submissions = await prisma.submission.findMany({
            where: {
                userId: user.id,
                challengeId
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
