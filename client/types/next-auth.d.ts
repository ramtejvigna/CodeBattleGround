import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username?: string;
            email: string;
            name?: string | null;
        };
    }

    interface User {
        id: string;
        username: string;
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
