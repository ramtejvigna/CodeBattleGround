import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema 
const profileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().optional(),
    preferredLanguage: z.string().default("JavaScript")
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if(!session || !session.user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const validation = profileSchema.safeParse(body);
        if(!validation.success) {
            return NextResponse.json(
                { messaage: "Validation failed", errors: validation.error.format() },
                { status: 400 }
            )
        }

        const { username, preferredLanguage } = validation.data;

        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json(
                { message: "Username is already taken" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username,
                userProfile: {
                    upsert: {
                        create: {
                            preferredLanguage,
                            rank: null,
                            solved: 0,
                            level: 1,
                            points: 0,
                            streakDays: 0,
                            badges: {
                                create: []
                            }
                        },
                        update: {
                            preferredLanguage
                        }
                    }
                }
            },
            include: {
                userProfile: true
            }
        });

        return NextResponse.json(
            {
                message: "Profile completed successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    name: user.name
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Profile completion error:", error);
        return NextResponse.json(
            {
                message: "Something went wrong",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}