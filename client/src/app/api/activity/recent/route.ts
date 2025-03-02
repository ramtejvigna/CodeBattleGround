import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        const limit = Number(url.searchParams.get('limit') || '5');

        if (userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to view this user\'s activity' },
                { status: 403 }
            );
        }

        const activities = await prisma.activity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const formattedActivities = activities.map(activity => ({
            ...activity,
            time: formatRelativeTime(activity.createdAt)
        }))

        return NextResponse.json(formattedActivities);
    } catch (error) {
        console.error('Error fetching recent activity : ', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    // If more than a week, return the actual date
    return date.toLocaleDateString();
}