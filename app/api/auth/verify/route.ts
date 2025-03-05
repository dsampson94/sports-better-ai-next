import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Extract token from cookies instead of URL params
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Missing authentication token" }, { status: 401 });
        }

        // Verify JWT
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (!decoded?.email) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Fetch user from DB
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 404 });
        }

        // Generate a new session token
        const sessionToken = jwt.sign(
            { email: user.email, role: user.role }, // Using role instead of isAdmin
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set the new token in HTTP-only cookie
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
        response.cookies.set("sportsbet_token", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Authentication Error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
}
