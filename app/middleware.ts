import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const config = {
    matcher: ["/dashboard/:path*"],
};

export function middleware(req: NextRequest) {
    const token = req.cookies.get("sportsbet_token")?.value;
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET!);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}
