import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Define types for the participation data
interface CompetitionParticipation {
  id: string;
  userId: string;
  competitionId: string;
  joinedAt: Date;
  leftAt?: Date;
  status: string;
  rank?: number;
  pointsEarned: number;
  challengesSolved: number;
  timeSpent: number;
  badges?: string[];
  perks?: any;
  performance?: any;
  completedAt?: Date;
  competition?: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: string;
    difficulty: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        competitions: {
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Try to get detailed participation data (will work after migration)
    let participations: CompetitionParticipation[] = [];
    try {
      // @ts-ignore - This will work after running the migration
      participations = await prisma.competitionParticipation.findMany({
        where: { userId: session.user.id },
        include: {
          competition: true
        },
        orderBy: { joinedAt: 'desc' }
      });
    } catch (error) {
      console.log("CompetitionParticipation table not yet available, using legacy approach");
    }

    // Calculate user's competition statistics
    const stats = {
      totalCompetitions: userProfile.competitions.length,
      upcomingCompetitions: userProfile.competitions.filter(c => new Date(c.startDate) > new Date()).length,
      activeCompetitions: userProfile.competitions.filter(c => 
        new Date(c.startDate) <= new Date() && new Date(c.endDate) >= new Date()
      ).length,
      completedCompetitions: userProfile.competitions.filter(c => new Date(c.endDate) < new Date()).length,
      totalPointsEarned: participations.reduce((sum: number, p: CompetitionParticipation) => sum + (p.pointsEarned || 0), 0),
      averageRank: participations.filter((p: CompetitionParticipation) => p.rank).length > 0 
        ? Math.round(participations.filter((p: CompetitionParticipation) => p.rank).reduce((sum: number, p: CompetitionParticipation) => sum + (p.rank || 0), 0) / participations.filter((p: CompetitionParticipation) => p.rank).length) 
        : null,
      badges: [] as string[],
      perks: [] as any[]
    };

    // Extract all badges and perks from participations
    if (participations.length > 0) {
      stats.badges = participations.flatMap((p: CompetitionParticipation) => p.badges || []).filter((badge: string, index: number, self: string[]) => self.indexOf(badge) === index);
      stats.perks = participations.map((p: CompetitionParticipation) => ({
        competitionId: p.competitionId,
        competitionTitle: p.competition?.title,
        perks: p.perks,
        pointsEarned: p.pointsEarned,
        status: p.status,
        joinedAt: p.joinedAt
      }));
    }

    return NextResponse.json({
      profile: userProfile,
      competitions: userProfile.competitions,
      participations: participations,
      statistics: stats
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user competitions:", error);
    return NextResponse.json({ error: "Failed to fetch user competitions" }, { status: 500 });
  }
}

// GET user's competition performance for a specific competition
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitionId } = await request.json();

    if (!competitionId) {
      return NextResponse.json({ error: "Competition ID required" }, { status: 400 });
    }

    // Try to get detailed participation data for specific competition
    let participation: CompetitionParticipation | null = null;
    try {
      // @ts-ignore - This will work after running the migration
      participation = await prisma.competitionParticipation.findUnique({
        where: {
          userId_competitionId: {
            userId: session.user.id,
            competitionId: competitionId
          }
        },
        include: {
          competition: true
        }
      });
    } catch (error) {
      console.log("CompetitionParticipation table not yet available");
    }

    // Fallback to legacy relationship
    if (!participation) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          competitions: {
            where: { id: competitionId }
          }
        }
      });

      if (userProfile && userProfile.competitions && userProfile.competitions.length > 0) {
        participation = {
          id: 'legacy',
          userId: session.user.id,
          competitionId: competitionId,
          competition: userProfile.competitions[0],
          status: 'JOINED',
          joinedAt: new Date(),
          pointsEarned: 0,
          challengesSolved: 0,
          timeSpent: 0,
          perks: null,
          performance: null
        };
      }
    }

    if (!participation) {
      return NextResponse.json({ error: "No participation found for this competition" }, { status: 404 });
    }

    return NextResponse.json({
      participation,
      competition: participation.competition,
      detailedPerks: participation.perks,
      performance: participation.performance
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching competition participation:", error);
    return NextResponse.json({ error: "Failed to fetch competition participation" }, { status: 500 });
  }
} 