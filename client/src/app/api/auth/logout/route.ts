import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if(!session) {
            return NextResponse.json(
                { message: 'No active session'},
                { status: 200 }
            )
        }

        return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { message: "Logout failed" },
            { status: 500 }
        );
    }
}