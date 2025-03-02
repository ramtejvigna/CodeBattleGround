import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
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
        Github({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    username: profile.login,
                    githubConnected: true,
                    githubUsername: profile.login,
                }
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECERT as string,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    username: profile.email.split('@')[0]
                }
            }
        })
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
            }

            // If this is a Github sign-in, update the user with Github info
            if (account?.provider === "github") {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { id: user.id }
                    });

                    if (existingUser) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                githubConnected: true,
                                githubUsername: user.username,
                            }
                        })
                    }
                } catch (error) {
                    console.error("Error updating GitHub info : ", error);
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
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            try {
                if (account?.provider === 'github' || account?.provider === 'google') {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        include: {
                            userProfile: true
                        }
                    })

                    if(!dbUser?.userProfile) return true;
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback : ", error);
                return true;
            }
        }
    },
    events: {
        async createUser({ user }) {
            console.log(`New user created: ${user.id}`);
        }
    }
};