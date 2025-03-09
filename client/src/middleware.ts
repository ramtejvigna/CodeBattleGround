import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
    '/profile',
    '/dashboard',
    '/challenge',
    '/settings',
    '/battles'
];

const authPaths = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.some(path => pathname.startsWith(path));

    // Check for the presence of a session cookie
    const sessionCookie = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');

    if (isProtectedPath && !sessionCookie) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthPath && sessionCookie) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        `/((?!api|_next|fonts|images|[\\w-]+\\.\\w+).*)`,
    ]
};