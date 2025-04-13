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

        // Get recent users (last 5 registered)
        const recentUsers = await prisma.user.findMany({
            include: {
                userProfile: {
                    select: {
                        level: true,
                        points: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        })

        return NextResponse.json({
            success: true,
            users: recentUsers,
        })
    } catch (error) {
        console.error("Error fetching recent users:", error)
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
    }
}

