import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const type = request.url.split('/').pop()

    // Validate the type parameter
    if (!type) {
      return NextResponse.json(
        { error: "Challenge type is required" },
        { status: 400 }
      )
    }

    // Convert to Prisma enum format and validate
    const formattedType = type.toUpperCase().replace('-', '_')
    const validTypes = ['ALGORITHM', 'DATA_STRUCTURE', 'SYSTEM_DESIGN']
    
    if (!validTypes.includes(formattedType)) {
      return NextResponse.json(
        { error: "Invalid challenge type" },
        { status: 400 }
      )
    }

    const challengeType = formattedType as 'ALGORITHM' | 'DATA_STRUCTURE' | 'SYSTEM_DESIGN'

    const challenges = await prisma.challenge.findMany({
      where: {
        challengeType,
      },
      include: {
        category: true,
        languages: true,
        likes: {
          select: {
            isLike: true,
          },
        },
        attempts: {
          select: {
            successful: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Ensure we have challenges to return
    if (!challenges || challenges.length === 0) {
      return NextResponse.json(
        { message: "No challenges found for this type" },
        { status: 404 }
      )
    }

    return NextResponse.json(challenges)
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    )
  }
}