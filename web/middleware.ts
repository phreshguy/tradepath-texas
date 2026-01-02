
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// SET TO TRUE TO ENABLE MAINTENANCE MODE
const IS_MAINTENANCE = false;

export function middleware(request: NextRequest) {
    if (IS_MAINTENANCE) {
        // Allow access to specific paths even in maintenance mode (e.g., admin, static files)
        if (
            request.nextUrl.pathname.startsWith('/_next') ||
            request.nextUrl.pathname.startsWith('/static') ||
            request.nextUrl.pathname.startsWith('/api') ||
            request.nextUrl.pathname === '/maintenance'
        ) {
            return NextResponse.next();
        }

        // Redirect all other traffic to maintenance page
        return NextResponse.rewrite(new URL('/maintenance', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
