import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { updateUserRanks } from "@/lib/services/updateRanks";

const prisma = new PrismaClient();

// Validation schema
const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().optional(),
    preferredLanguage: z.string().optional()
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate the request body
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: "Validation failed", errors: validation.error.format() },
                { status: 400 }
            );
        }

        const { email, password, username, fullName, preferredLanguage } = validation.data;

        // Check if a user with the same email or username already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email or username already exists" },
                { status: 400 }
            );
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create the user and their profile
        const user = await prisma.user.create({
            data: {
                email,
                username,
                name: fullName || username,
                password: hashPassword,
                userProfile: {
                    create: {
                        preferredLanguage: preferredLanguage || 'JavaScript',
                        rank: null, // Don't set rank here, it will be calculated by the rankings API
                        solved: 0,
                        level: 1,
                        points: 0,
                        streakDays: 0,
                        badges: {
                            create: []
                        }
                    }
                }
            },
            include: {
                userProfile: true
            }
        });

        await updateUserRanks();

        // Exclude the password from the response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                message: "User created successfully",
                user: userWithoutPassword
            },
            {
                status: 201
            }
        );

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            {
                message: "Something went wrong",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}