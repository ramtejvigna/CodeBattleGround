import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/api/auth/callback/google`);
    } catch (error) {
        console.error('Error initiating Google authentication:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}