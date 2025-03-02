import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username?: string;
            githubUsername?: string;
            githubConnected?: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        username?: string;
        githubConnected?: boolean;
        githubUsername?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username?: string;
    }
}