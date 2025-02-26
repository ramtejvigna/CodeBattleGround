import { NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const result = await signIn("credentials", {
            redirect: false,
            email,
            password
        });

        if (!result?.ok) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { userProfile: true }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}