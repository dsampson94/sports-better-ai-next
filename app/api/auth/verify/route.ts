import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
    await connectToDatabase();

    // Get token from URL query parameters
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Missing authentication token" }, { status: 401 });
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (!decoded.email) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 404 });
        }

        // Token is valid, set the cookie for future authentication
        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        response.cookies.set("sportsbet_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days, adjust as needed
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}
