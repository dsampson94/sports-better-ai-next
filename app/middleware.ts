import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('sportsbet_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET!);
        return NextResponse.next();
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }
}

// Specify routes you want to protect
export const config = {
    matcher: ['/api/admin/:path*', '/api/user/:path*', '/api/voice-notes/:path*'],
};
