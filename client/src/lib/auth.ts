import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    if (!user || !user.password) return null;

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) return null;

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        username: user.username
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    return null;
                }
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
            profile(profile) {
                console.log(profile)
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email ?? `${profile.login}@github.com`,
                    image: profile.avatar_url,
                    username: profile.login,
                    githubConnected: true,
                    githubUsername: profile.login,
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    username: profile.email.split('@')[0]
                }
            }
        }),
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
        newUser: "/onboarding"
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                if ('username' in user) {
                    token.username = user.username;
                }
                if ('githubUsername' in user) {
                    token.githubUsername = user.githubUsername;
                }
                if ('githubConnected' in user) {
                    token.githubConnected = user.githubConnected;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                if (token.username) {
                    session.user.username = token.username as string;
                }
                if (token.githubUsername) {
                    session.user.githubUsername = token.githubUsername as string;
                }
                if (token.githubConnected) {
                    session.user.githubConnected = token.githubConnected as boolean;
                }
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            try {
                if (account?.provider === 'github' || account?.provider === 'google') {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email ?? undefined },
                        include: {
                            userProfile: true
                        }
                    });

                    // Create user profile if it doesn't exist
                    if (dbUser && !dbUser.userProfile) {
                        await prisma.userProfile.create({
                            data: {
                                userId: dbUser.id,
                                preferredLanguage: 'JavaScript',
                                rank: 0,
                                solved: 0,
                                level: 1,
                                points: 0,
                                streakDays: 0
                            }
                        });
                    }
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return true; // Continue with sign in even if profile creation fails
            }
        }
    },
    cookies: {
        sessionToken: {
            name: 'next-auth.session-token', // Ensure this matches the cookie name in your middleware
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            },
        },
    },
};