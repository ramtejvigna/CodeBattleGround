import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Await the params object before destructuring
    const resolvedParams = await params
    const userId = resolvedParams.userId

    // Fetch user profile with related data
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        badges: true,
        languages: true,
      },
    })

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}