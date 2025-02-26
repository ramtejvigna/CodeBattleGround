import { NextResponse } from "next/server";
import { signOut } from "next-auth/react";

export async function POST() {
    try {
        await signOut({ redirect: false });
        return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { message: "Logout failed" },
            { status: 500 }
        );
    }
}