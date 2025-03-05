import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('sportsbet_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Token missing' }, { status: 401 });
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized: Invalid Token' }, { status: 401 });
        }

        req.headers.set('X-User-Email', decoded.email);
        req.headers.set('X-User-IsAdmin', decoded.isAdmin ? 'true' : 'false');

        return NextResponse.next();
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized: Token invalid or expired' }, { status: 401 });
    }
}

// Apply middleware to specific routes
export const config = {
    matcher: ['/api/admin/:path*', '/api/user/:path*'], // Secured routes
};
