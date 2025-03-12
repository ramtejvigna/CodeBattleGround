import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Instantiate PrismaClient outside of the request handler
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const user = await prisma.user.findMany({
            include: {
                userProfile: {
                    include: {
                        badges: true,
                        languages: true
                    }
                },
                activites: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }
        // Return the user object directly since there is no password field
        return NextResponse.json(
            { success: true, user: user },
            { status: 200 }
        );

    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Something went wrong", error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}