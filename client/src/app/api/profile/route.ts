import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Instantiate PrismaClient outside of the request handler
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                userProfile: {
                    include: {
                        badges: true,
                        languages: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const pointsBreakdown = await calculatePointsBreakdown(user.id);

        // Remove the password field from the user object
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(
            { success: true, user: {
                ...userWithoutPassword,
                pointsBreakdown
            } },
            { status: 200 }
        );

    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Something went wrong", error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

async function calculatePointsBreakdown(userId: string) {
    const activities = await prisma.activity.findMany({
        where: { userId },
    });

    let challenges = 0;
    let contests = 0;
    let badges = 0;
    let discussions = 0;

    activities.forEach(activity => {
        if (activity.type === 'CHALLENGE') {
            challenges += activity.points;
        } else if (activity.type === 'CONTEST') {
            contests += activity.points;
        } else if (activity.type === 'BADGE') {
            badges += activity.points;
        } else if (activity.type === 'DISCUSSION') {
            discussions += activity.points;
        }
    });

    return {
        challenges,
        contests,
        badges, 
        discussions
    }
}