import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { provider, providerAccountId, accessToken } = await request.json();

        if (!provider || !providerAccountId) {
            return NextResponse.json(
                { error: "Provider and providerAccountId are required" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { accounts: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if account is already linked
        const existingAccount = user.accounts.find(
            acc => acc.provider === provider && acc.providerAccountId === providerAccountId
        );

        if (existingAccount) {
            return NextResponse.json(
                { message: "Account already linked" },
                { status: 200 }
            );
        }

        // Link the account
        await prisma.account.create({
            data: {
                userId: user.id,
                provider,
                providerAccountId,
                type: "oauth",
                access_token: accessToken,
            }
        });

        return NextResponse.json(
            { message: "Account linked successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error linking account:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 