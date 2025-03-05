import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from '../../../lib/mongoose';
import Transaction from '../../../lib/models/Transaction';

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

        // Fetch all transactions
        const transactions = await Transaction.find().sort({ createdAt: -1 });

        return NextResponse.json({ transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
