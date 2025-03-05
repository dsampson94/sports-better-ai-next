import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import jwt from "jsonwebtoken";

/**
 * GET /api/admin/users
 * Requires admin authentication. Returns a list of all registered users.
 */
export async function GET(req: NextRequest) {
    try {
        // Authenticate the user via token
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Connect to the database
        await connectToDatabase();

        // Check if user is admin
        const adminUser = await User.findOne({ email: decoded.email });
        if (!adminUser || adminUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
        }

        // Fetch all users from the database
        const users = await User.find({}, "email username balance subscriptionStatus createdAt");

        return NextResponse.json({ users });
    } catch (error: any) {
        console.error("❌ [Admin Users API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
