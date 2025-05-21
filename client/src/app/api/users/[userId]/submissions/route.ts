import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get("from")

    // Build query filters
    const filters: any = {
      userId: userId,
    }

    // Add date filter if provided
    if (from) {
      filters.createdAt = {
        gte: new Date(from),
      }
    }

    // Fetch submissions with related data
    const submissions = await prisma.submission.findMany({
      where: filters,
      include: {
        challenge: {
          include: {
            category: true,
          },
        },
        language: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
