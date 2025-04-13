import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
    try {
        // Check authentication and authorization
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        // Check if user is an admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            select: { role: true },
        })

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        // Get dashboard stats
        const totalUsers = await prisma.user.count()

        // Get active users (users who have been active in the last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const activeUsers = await prisma.user.count({
            where: {
                OR: [{ lastActive: { gte: thirtyDaysAgo } }, { sessions: { some: { expires: { gte: thirtyDaysAgo } } } }],
            },
        })

        // Get total challenges
        const totalChallenges = await prisma.challenge.count()

        // Get total submissions
        const totalSubmissions = await prisma.submission.count()

        // Calculate completion rate
        const successfulSubmissions = await prisma.submission.count({
            where: { status: "ACCEPTED" },
        })

        const completionRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0

        // Get new users today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const newUsersToday = await prisma.user.count({
            where: { createdAt: { gte: today } },
        })

        // Get active users today
        const activeUsersToday = await prisma.user.count({
            where: {
                OR: [{ lastActive: { gte: today } }, { sessions: { some: { expires: { gte: today } } } }],
            },
        })

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalChallenges,
                totalSubmissions,
                completionRate,
                newUsersToday,
                activeUsersToday,
            },
        })
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
    }
}

