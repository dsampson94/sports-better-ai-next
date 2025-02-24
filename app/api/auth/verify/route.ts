import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const token = req.nextUrl.searchParams.get("token");
        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        // Verify token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decoded.email) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Ensure user exists
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 404 });
        }

        // Create session token, e.g. 7 days
        const sessionToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });

        // Set HTTP-only cookie
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
        response.cookies.set("sportsbet_token", sessionToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
            secure: true,
            sameSite: "strict",
        });

        return response;
    } catch (error) {
        console.error("Verify Magic Link Error:", error);
        return NextResponse.json(
            { error: "Invalid or expired link" },
            { status: 401 }
        );
    }
}
