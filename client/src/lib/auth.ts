import { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            username?: string;
            githubUsername?: string;
            githubConnected?: boolean;
            role?: string;
        };
    }

    interface User {
        role?: string;
    }
}

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

                    if(user.role === "USER") {
                        const isPasswordValid = await bcrypt.compare(
                            credentials.password,
                            user.password
                        );
    
                        if (!isPasswordValid) return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
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
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email ?? `${profile.login}@github.com`,
                    image: profile.avatar_url,
                    role: profile.role,
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
                    role: profile.role,
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
                token.role = user.role;
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
                session.user.role = token.role as string;
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
                            userProfile: true,
                            accounts: true
                        }
                    });

                    if (dbUser) {
                        // Check if user already has this OAuth account linked
                        const existingAccount = dbUser.accounts.find(
                            acc => acc.provider === account.provider
                        );

                        if (!existingAccount) {
                            // User exists but doesn't have this OAuth provider linked
                            // Auto-link the account
                            await prisma.account.create({
                                data: {
                                    userId: dbUser.id,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId!,
                                    type: account.type,
                                    access_token: account.access_token,
                                    refresh_token: account.refresh_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    session_state: account.session_state
                                }
                            });
                        }

                        // Create user profile if it doesn't exist
                        if (!dbUser.userProfile) {
                            await prisma.userProfile.create({
                                data: {
                                    userId: dbUser.id,
                                    preferredLanguage: 'JavaScript',
                                    rank: null,
                                    solved: 0,
                                    level: 1,
                                    points: 0,
                                    streakDays: 0
                                }
                            });
                        }
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