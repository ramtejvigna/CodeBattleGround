import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Properly await params before accessing its properties
    const { id: competitionId } = await params;
    
    // Find user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Check if competition exists and user is participating
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        participants: {
          where: { id: userProfile.id }
        }
      }
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    // Check if user is participating
    if (competition.participants.length === 0) {
      return NextResponse.json({ error: "Not participating in this competition" }, { status: 400 });
    }

    // Check if competition has already started (can only leave upcoming competitions)
    const now = new Date();
    if (new Date(competition.startDate) <= now) {
      return NextResponse.json({ error: "Cannot leave competition that has already started" }, { status: 400 });
    }

    // Try to update participation record (will work after migration)
    let participation = null;
    let leavingPenalty = 0;
    try {
      // @ts-ignore - This will work after running the migration
      participation = await prisma.competitionParticipation.findUnique({
        where: {
          userId_competitionId: {
            userId: session.user.id,
            competitionId: competitionId
          }
        }
      });

      if (participation) {
        // Calculate leaving penalty (lose some join bonus points)
        const joinBonus = participation.pointsEarned || 0;
        leavingPenalty = Math.floor(joinBonus * 0.5); // Lose half of join bonus

        // @ts-ignore - This will work after running the migration
        await prisma.competitionParticipation.update({
          where: {
            userId_competitionId: {
              userId: session.user.id,
              competitionId: competitionId
            }
          },
          data: {
            status: 'LEFT',
            leftAt: new Date(),
            pointsEarned: { decrement: leavingPenalty },
            perks: {
              ...participation.perks,
              leftEarly: true,
              leavingPenalty: leavingPenalty,
              leftAt: new Date().toISOString()
            }
          }
        });

        // Update user profile to deduct penalty points
        await prisma.userProfile.update({
          where: { userId: session.user.id },
          data: {
            points: { decrement: leavingPenalty }
          }
        });
      }
    } catch (error) {
      console.log("CompetitionParticipation table not yet available, using legacy approach");
    }

    // Remove user from competition participants (legacy relationship)
    const updatedCompetition = await prisma.competition.update({
      where: { id: competitionId },
      data: {
        participants: {
          disconnect: { id: userProfile.id }
        }
      },
      include: {
        participants: true
      }
    });

    return NextResponse.json({ 
      message: "Successfully left competition",
      competition: updatedCompetition,
      participation: participation,
      penalty: leavingPenalty > 0 ? {
        points: leavingPenalty,
        message: `You lost ${leavingPenalty} points for leaving the competition early.`
      } : null,
      note: leavingPenalty === 0 ? "No penalty applied as you didn't earn join bonus points yet." : undefined
    }, { status: 200 });

  } catch (error) {
    console.error("Error leaving competition:", error);
    return NextResponse.json({ error: "Failed to leave competition" }, { status: 500 });
  }
} 