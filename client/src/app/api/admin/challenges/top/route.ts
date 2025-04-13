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

        // Get top challenges by submission count
        const challenges = await prisma.challenge.findMany({
            include: {
                category: true,
                submissions: true,
            },
            orderBy: {
                submissions: {
                    _count: "desc",
                },
            },
            take: 5,
        })

        // Calculate success rate for each challenge
        const topChallenges = challenges.map((challenge) => {
            const totalSubmissions = challenge.submissions.length
            const successfulSubmissions = challenge.submissions.filter(
                (submission) => submission.status === "ACCEPTED",
            ).length

            const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0

            return {
                id: challenge.id,
                title: challenge.title,
                difficulty: challenge.difficulty,
                submissions: totalSubmissions,
                successRate,
                category: challenge.category,
            }
        })

        return NextResponse.json({
            success: true,
            challenges: topChallenges,
        })
    } catch (error) {
        console.error("Error fetching top challenges:", error)
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
    }
}

