import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = [
    '/profile',
    '/dashboard',
    '/challenge',
    '/battles'
]

const authPaths = ['/login', '/signup', '/registration'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    const isAuthPath = authPaths.some(path => pathname.startsWith(path));

    const token = await getToken({ req: req });

    if(isProtectedPath && !token) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthPath && token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        `/((?!api|_next|fonts|images|[\\w-]+.\\w+).*)`,
    ]
}