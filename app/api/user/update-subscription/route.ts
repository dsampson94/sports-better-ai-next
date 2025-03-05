import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import { SUBSCRIPTION_PLANS } from "../../../lib/config";

export async function POST(req: NextRequest) {
    try {
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

        const { amountPaid } = await req.json();
        if (!amountPaid) {
            return NextResponse.json({ error: "Invalid request. Missing amountPaid." }, { status: 400 });
        }

        let subscriptionType: keyof typeof SUBSCRIPTION_PLANS | null = null;
        for (const plan in SUBSCRIPTION_PLANS) {
            if (SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].price === amountPaid) {
                subscriptionType = plan as keyof typeof SUBSCRIPTION_PLANS;
                break;
            }
        }

        if (subscriptionType) {
            const planDetails = SUBSCRIPTION_PLANS[subscriptionType];

            user.subscriptionPlan = subscriptionType;
            user.subscriptionStatus = "active";
            user.aiCallAllowance += planDetails.aiCalls;
        } else {
            user.balance = (user.balance || 0) + amountPaid;
        }

        await user.save();

        return NextResponse.json({
            success: true,
            subscriptionPlan: user.subscriptionPlan,
            aiCallAllowance: user.aiCallAllowance,
            balance: user.balance,
        }, { status: 200 });

    } catch (err: any) {
        console.error("❌ [update-subscription] Error:", err);
        return NextResponse.json({ error: "Internal error updating subscription" }, { status: 500 });
    }
}
