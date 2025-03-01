import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { userId } = body;

        if (userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to modify this user' },
                { status: 403 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                githubConnected: false,
                githubUsername: null
            }
        })

        return NextResponse.json({
            success: true,
            user: updatedUser
        })
    } catch (error) {
        console.error('Error disconnecting GitHub', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}