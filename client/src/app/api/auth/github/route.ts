import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            )
        }

        const callbackUrl = encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/auht/callback/github`);
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_ID}&redirect_uri=${callbackUrl}&scope=user:email,read:user`;
    
        return NextResponse.redirect(githubAuthUrl);
    } catch (error) {
        console.error('Error initiating GitHub connection : ', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}