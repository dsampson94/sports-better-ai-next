import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';

export async function GET(req: NextRequest) {
    try {
        // decode token to get user email
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return relevant profile fields
        return NextResponse.json({
            email: user.email,
            username: user.username,
            // @ts-ignore
            balance: user.balance ?? 0,    // or usageCount, subscriptionStatus, etc.
            // any other fields you want
        });
    } catch (error: any) {
        console.error("GET /api/user/me error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
