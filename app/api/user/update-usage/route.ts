import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import { SUBSCRIPTION_PLANS } from '../../payfast/notify/route';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const plan = SUBSCRIPTION_PLANS[user.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS];
        const costPerCall = plan ? (plan.price / plan.aiCalls) : 0.50;

        if (user.aiCallAllowance > 0) {
            user.aiCallAllowance -= 1;
        } else {
            if (user.balance < costPerCall) {
                return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
            }
            user.balance -= costPerCall;
        }

        await user.save();

        return NextResponse.json({
            updatedBalance: user.balance,
            aiCallAllowance: user.aiCallAllowance
        });
    } catch (err: any) {
        return NextResponse.json({ error: "Internal error updating usage" }, { status: 500 });
    }
}
