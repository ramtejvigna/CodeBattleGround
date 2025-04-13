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

        // Get query parameters
        const url = new URL(req.url)
        const page = Number.parseInt(url.searchParams.get("page") || "1")
        const limit = Number.parseInt(url.searchParams.get("limit") || "10")
        const sortColumn = url.searchParams.get("sort") || "createdAt"
        const sortDirection = url.searchParams.get("direction") || "desc"
        const filter = url.searchParams.get("filter") || "all"
        const search = url.searchParams.get("search") || ""

        // Calculate pagination
        const skip = (page - 1) * limit

        // Build where clause based on filters
        const where: any = {}

        if (search) {
            where.OR = [
                { username: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
            ]
        }

        if (filter === "active") {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            where.OR = [{ lastActive: { gte: thirtyDaysAgo } }, { sessions: { some: { expires: { gte: thirtyDaysAgo } } } }]
        } else if (filter === "inactive") {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            where.AND = [{ lastActive: { lt: thirtyDaysAgo } }, { sessions: { none: { expires: { gte: thirtyDaysAgo } } } }]
        } else if (filter === "admin") {
            where.role = "ADMIN"
        }

        // Get users with pagination and sorting
        const users = await prisma.user.findMany({
            where,
            include: {
                userProfile: {
                    select: {
                        level: true,
                        points: true,
                        rank: true,
                        solved: true,
                    },
                },
            },
            orderBy: {
                [sortColumn]: sortDirection,
            },
            skip,
            take: limit,
        })

        // Get total count for pagination
        const totalUsers = await prisma.user.count({ where })
        const totalPages = Math.ceil(totalUsers / limit)

        // Map users to include status
        const mappedUsers = users.map((user) => {
            // Determine user status (this is a simplified example)
            let status = "ACTIVE"

            if (user.lastActive) {
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                if (new Date(user.lastActive) < thirtyDaysAgo) {
                    status = "INACTIVE"
                }
            } else {
                status = "INACTIVE"
            }

            return {
                ...user,
                status,
            }
        })

        return NextResponse.json({
            success: true,
            users: mappedUsers,
            totalPages,
            currentPage: page,
            totalUsers,
        })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
    }
}

