import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';

export async function GET(req: NextRequest) {
    try {
        // Authenticate Admin User
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decoded || decoded.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Connect to MongoDB
        await connectToDatabase();

        // Fetch all users
        const users = await User.find().sort({ createdAt: -1 });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
