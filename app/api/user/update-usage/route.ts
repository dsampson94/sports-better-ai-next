import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
// Import the Transaction model
import Transaction, { ITransaction } from "../../../lib/models/Transaction";

export async function POST(req: NextRequest) {
    try {
        // Authenticate user via token in cookies
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
        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Apply cost logic:
        // - First 3 analyses are free.
        // - After that, each analysis costs $0.50.
        const freeCount = user.freePredictionCount || 0;
        const cost = freeCount < 3 ? 0 : 0.50;
        if (cost > 0 && (user.balance || 0) < cost) {
            return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }

        let transactionDescription = "";
        if (freeCount < 3) {
            user.freePredictionCount = freeCount + 1;
            transactionDescription = "Free analysis usage recorded";
        } else {
            user.balance = (user.balance || 0) - cost;
            transactionDescription = "Analysis usage deduction of $0.50";
        }
        await user.save();

        // Create and save a transaction log for this usage
        const transaction: ITransaction = new Transaction({
            user: user._id,
            amount: cost,
            type: cost > 0 ? 'debit' : 'credit',
            description: transactionDescription,
        });
        await transaction.save();

        return NextResponse.json({
            updatedBalance: user.balance,
            freePredictionCount: user.freePredictionCount,
        });
    } catch (err: any) {
        console.error("❌ [update-usage] Error:", err);
        return NextResponse.json({ error: "Internal error updating usage" }, { status: 500 });
    }
}
