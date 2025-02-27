import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                userProfile: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Remove the password field from the user object
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(
            { user: userWithoutPassword },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}