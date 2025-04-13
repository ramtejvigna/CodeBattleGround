import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Instantiate PrismaClient outside of the request handler
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: "USER",
            },
            include: {
                userProfile: {
                    include: {
                        badges: true,
                        languages: true
                    }
                },
                activites: true
            },
            orderBy: {
                userProfile: {
                    points: 'desc'
                }
            }
        });

        if (!users || users.length === 0) {
            return NextResponse.json(
                { message: "No users found" },
                { status: 404 }
            );
        }

        // Return the users array directly since there is no password field
        return NextResponse.json(
            { success: true, users: users, message: "Successfully fetched top users data" },
            { status: 200 }
        );

    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Something went wrong", error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}