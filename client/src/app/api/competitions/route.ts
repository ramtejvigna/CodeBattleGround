import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { CompetitionStatus } from "@prisma/client";

export async function GET(request: NextRequest, response: NextResponse) {
    try {
        const competitions = await prisma.competition.findMany({
            include: {
                participants: {
                    select: {
                        id: true,
                        userId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(competitions, { status: 200 });
    } catch (error) {
        console.error("Error fetching competitions:", error);
        return NextResponse.json({ error: "Failed to fetch competitions" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        const { title, description, startDate, endDate, difficulty } = await request.json();

        const competition = await prisma.competition.create({
            data: {
                title,
                description,
                startDate,
                endDate,
                status: CompetitionStatus.UPCOMING,
                difficulty,
            }
        })

        return NextResponse.json(competition, { status: 201 });
    } catch (error) {
        console.error("Error creating competition:", error);
        return NextResponse.json({ error: "Failed to create competition" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, res: NextResponse) {
    try {
        const { id, title, description, startDate, endDate, difficulty } = await req.json();

        const competition = await prisma.competition.update({
            where: { id },
            data: { title, description, startDate, endDate, difficulty }
        })

        return NextResponse.json(competition, { status: 200 });
    } catch (error) {
        console.error("Error updating competition:", error);
        return NextResponse.json({ error: "Failed to update competition" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, res: NextResponse) {
    try {
        const { id } = await req.json();
        const competition = await prisma.competition.delete({
            where: { id }
        })

        return NextResponse.json(competition, { status: 200 });
    } catch (error) {
        console.error("Error deleting competition:", error);
        return NextResponse.json({ error: "Failed to delete competition" }, { status: 500 });
    }
}