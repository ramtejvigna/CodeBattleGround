import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const languages = await prisma.language.findMany();

        return NextResponse.json({ languages: languages });

    } catch (error) {
        return NextResponse.json({
            error: 'Failed to fetch languages',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}