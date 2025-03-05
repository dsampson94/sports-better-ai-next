import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "./lib/mongoose";
import User from './lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authenticateAdmin(req: NextRequest) {
    try {
        await connectToDatabase();

        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (!decoded.email) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await User.findOne({ email: decoded.email }).select("role");
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return { user }; // ✅ Success, return the authenticated user
    } catch (error) {
        console.error("Auth Error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
