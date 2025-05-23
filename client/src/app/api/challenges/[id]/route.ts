import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Extract id from the URL path using Next.js params
    const id = request.url.split("/").pop()

    const challenge = await prisma.challenge.findUnique({
      where: { id: id },
      include: {
        category: true,
        languages: true,
        testCases: true,
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            submissions: true,
          },
        },
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Fetch submission statistics
    const submissionStats = await prisma.submission.aggregate({
      where: { challengeId: id },
      _avg: {
        runtime: true,
        memory: true,
      },
      _count: {
        status: true,
      },
    })

    return NextResponse.json({
      ...challenge,
      likes: challenge._count.likes,
      submissions: challenge._count.submissions,
      languages: challenge.languages,
      submissionStats: {
        avgRuntime: submissionStats._avg.runtime || 0,
        avgMemory: submissionStats._avg.memory || 0,
        statusCounts: submissionStats._count.status,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch challenge details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
