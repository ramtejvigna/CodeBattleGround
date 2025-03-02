import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const url = new URL(req.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?error=No+authorization+code+provided`);
        }

        const tokenResponse = await getGithubAccessToken(code);

        if (!tokenResponse.access_token) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?error=Failed+to+get+access+token`);
        }

        // Get user info from GitHub API
        const githubUser = await getGithubUserInfo(tokenResponse.access_token);

        if (!githubUser.login) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?error=Failed+to+get+GitHub+user+info`);
        }

        if (session) {
            // User is already logged in, update their account with GitHub info
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    githubConnected: true,
                    githubUsername: githubUser.login
                }
            });

            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?success=GitHub+connected`);
        } else {
            // User is not logged in, create a new account with GitHub info
            await prisma.user.create({
                data: {
                    email: githubUser.email || `${githubUser.login}@github.com`, // Fallback email if GitHub email is not provided
                    name: githubUser.name || githubUser.login,
                    username: githubUser.login, // Add required username field
                    githubConnected: true,
                    githubUsername: githubUser.login
                }
            });

            // Here you would typically log the user in using the newly created account
            // For example, you might create a session or JWT token for the user

            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?success=GitHub+login+successful`);
        }
    } catch (error) {
        console.error('Error in GitHub callback:', error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?error=Internal+server+error`);
    }
}

async function getGithubAccessToken(code: string) {
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_ID,
            client_secret: process.env.GITHUB_SECRET,
            code
        })
    });

    return await response.json();
}

async function getGithubUserInfo(accessToken: string) {
    const userUrl = 'https://api.github.com/user';
    const response = await fetch(userUrl, {
        headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    return await response.json();
}