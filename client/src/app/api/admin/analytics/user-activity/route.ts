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

        // Get user activity data for the last 14 days
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 14)

        // Generate dates array
        const dates = []
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }

        // For each date, get active users and new users
        const activityData = await Promise.all(
            dates.map(async (date) => {
                const nextDay = new Date(date)
                nextDay.setDate(nextDay.getDate() + 1)

                // Get active users for this day
                const activeUsers = await prisma.user.count({
                    where: {
                        OR: [
                            { lastActive: { gte: date, lt: nextDay } },
                            { sessions: { some: { expires: { gte: date, lt: nextDay } } } },
                        ],
                    },
                })

                // Get new users for this day
                const newUsers = await prisma.user.count({
                    where: {
                        createdAt: { gte: date, lt: nextDay },
                    },
                })

                return {
                    date: date.toISOString().split("T")[0],
                    activeUsers,
                    newUsers,
                }
            }),
        )

        return NextResponse.json({
            success: true,
            data: activityData,
        })
    } catch (error) {
        console.error("Error fetching user activity data:", error)
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
    }
}

