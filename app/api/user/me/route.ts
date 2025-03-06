import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";

export async function GET(req: NextRequest) {
    try {
        // Decode token to get user email
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email }).lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error: any) {
        console.error("GET /api/user/me error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
