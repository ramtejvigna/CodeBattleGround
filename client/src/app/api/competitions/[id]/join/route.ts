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
    
    // Check if competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        participants: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    // Check if user is already participating
    if (competition.participants.length > 0) {
      return NextResponse.json({ error: "Already participating in this competition" }, { status: 400 });
    }

    // Check if competition is still upcoming (can only join upcoming competitions)
    const now = new Date();
    if (new Date(competition.startDate) <= now) {
      return NextResponse.json({ error: "Cannot join competition that has already started" }, { status: 400 });
    }

    // Find or create user profile
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!userProfile) {
      // Create basic user profile if it doesn't exist
      userProfile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          bio: "No bio provided",
          solved: 0,
          preferredLanguage: "javascript",
          level: 1,
          points: 0,
          streakDays: 0,
        }
      });
    }

    // Calculate joining perks based on competition difficulty and user level
    const baseJoinBonus = competition.difficulty === 'EASY' ? 5 : 
                         competition.difficulty === 'MEDIUM' ? 10 : 
                         competition.difficulty === 'HARD' ? 15 : 20;
    
    const levelMultiplier = Math.max(1, userProfile.level * 0.1);
    const joinBonus = Math.floor(baseJoinBonus * levelMultiplier);

    // Try to create detailed participation record (will work after migration)
    let participation = null;
    try {
      // @ts-ignore - This will work after running the migration
      participation = await prisma.competitionParticipation.create({
        data: {
          userId: session.user.id,
          competitionId: competitionId,
          status: 'JOINED',
          pointsEarned: joinBonus,
          perks: {
            joinBonus: joinBonus,
            earlyBird: Date.now() < new Date(competition.startDate).getTime() - 24 * 60 * 60 * 1000, // 24 hours before
            competitionLevel: competition.difficulty,
            expectedRewards: {
              completion: baseJoinBonus * 2,
              topPerformer: baseJoinBonus * 5,
              badges: competition.difficulty === 'EXPERT' ? ['Expert Challenger'] : []
            }
          },
          performance: {
            joinedEarly: Date.now() < new Date(competition.startDate).getTime() - 24 * 60 * 60 * 1000,
            userLevelAtJoin: userProfile.level,
            expectedChallenges: competition.difficulty === 'EASY' ? 3 : 
                              competition.difficulty === 'MEDIUM' ? 5 : 
                              competition.difficulty === 'HARD' ? 8 : 12
          }
        }
      });
    } catch (error) {
      console.log("CompetitionParticipation table not yet available, using legacy approach");
    }

    // Update user profile with join bonus
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        points: { increment: joinBonus }
      }
    });

    // Add user to competition participants (legacy relationship)
    const updatedCompetition = await prisma.competition.update({
      where: { id: competitionId },
      data: {
        participants: {
          connect: { id: userProfile.id }
        }
      },
      include: {
        participants: true
      }
    });

    return NextResponse.json({ 
      message: "Successfully joined competition",
      competition: updatedCompetition,
      participation: participation,
      bonusEarned: joinBonus,
      perks: {
        joinBonus: joinBonus,
        earlyBird: Date.now() < new Date(competition.startDate).getTime() - 24 * 60 * 60 * 1000,
        message: `You earned ${joinBonus} points for joining this ${competition.difficulty.toLowerCase()} competition!`,
        expectedRewards: {
          completion: baseJoinBonus * 2,
          topPerformer: baseJoinBonus * 5,
          badges: competition.difficulty === 'EXPERT' ? ['Expert Challenger'] : []
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error joining competition:", error);
    return NextResponse.json({ error: "Failed to join competition" }, { status: 500 });
  }
} 