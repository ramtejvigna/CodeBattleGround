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
        const userId = url.searchParams.get('userId') || session.user.id;
        const page = Number(url.searchParams.get('page') || '1');
        const limit = Number(url.searchParams.get('limit') || '20');
        const activityType = url.searchParams.get('type'); // filter by type if provided
        const timeRange = url.searchParams.get('timeRange'); // week, month, year

        // Authorization check - users can only view their own activities for now
        if (userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to view this user\'s activity' },
                { status: 403 }
            );
        }

        // Build where clause
        const where: any = { userId };

        // Add type filter if provided
        if (activityType && activityType !== 'all') {
            where.type = activityType;
        }

        // Add time range filter if provided
        if (timeRange && timeRange !== 'all') {
            const now = new Date();
            let fromDate: Date;
            
            switch (timeRange) {
                case 'week':
                    fromDate = new Date(now);
                    fromDate.setDate(fromDate.getDate() - 7);
                    break;
                case 'month':
                    fromDate = new Date(now);
                    fromDate.setMonth(fromDate.getMonth() - 1);
                    break;
                case 'year':
                    fromDate = new Date(now);
                    fromDate.setFullYear(fromDate.getFullYear() - 1);
                    break;
                default:
                    fromDate = new Date(0); // All time
            }
            
            where.createdAt = {
                gte: fromDate
            };
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const totalCount = await prisma.activity.count({ where });

        // Fetch activities with pagination
        const activities = await prisma.activity.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        });

        // Format activities with relative time
        const formattedActivities = activities.map(activity => ({
            id: activity.id,
            userId: activity.userId,
            type: activity.type,
            name: activity.name,
            result: activity.result,
            points: activity.points,
            createdAt: activity.createdAt,
            time: formatRelativeTime(activity.createdAt),
            user: activity.user
        }));

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        return NextResponse.json({
            activities: formattedActivities,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasMore,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
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

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    // If more than a year, return the actual date
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
} 