import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if(!session) {
            return NextResponse.json(null, { status: 401 });
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error('Session errror : ', error);
        return NextResponse.json(
            { message : 'Internal server error' },
            { status: 500 }
        );
    }
}