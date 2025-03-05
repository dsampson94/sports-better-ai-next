import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import Transaction from "../../../lib/models/Transaction";
import User from "../../../lib/models/User";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        await connectToDatabase();
        const requestingUser = await User.findOne({ email: decoded.email });

        if (!requestingUser || requestingUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const transactions = await Transaction.find({});
        return NextResponse.json({ transactions });
    } catch (error: any) {
        console.error("GET /api/admin/transactions error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
