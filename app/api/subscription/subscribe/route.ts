import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { plan } = await req.json();
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

        // Define subscription prices
        const plans = {
            basic: { price: 5, aiCalls: 20, duration: 30 },
            standard: { price: 10, aiCalls: 40, duration: 30 },
            premium: { price: 25, aiCalls: 100, duration: 30 },
        };

        if (!plans[plan]) {
            return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
        }

        const { price } = plans[plan];

        // Generate PayFast payment data
        const data: Record<string, string> = {
            merchant_id: process.env.PAYFAST_MERCHANT_ID!,
            merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=cancelled`,
            notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/payfast-notify`,
            name_first: user.username || user.email.split("@")[0],
            email_address: user.email,
            m_payment_id: `sub-${user._id}-${Date.now()}`,
            amount: price.toFixed(2),
            item_name: `Subscription - ${plan}`,
        };

        // Generate signature
        data.signature = generateSignature(data, process.env.PAYFAST_PASSPHRASE!);

        return NextResponse.json({
            actionUrl: process.env.PAYFAST_ENVIRONMENT === "live"
                ? "https://www.payfast.co.za/eng/process"
                : "https://sandbox.payfast.co.za/eng/process",
            formData: data,
        });
    } catch (error: any) {
        console.error("Subscription Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Helper function to generate PayFast signature
function generateSignature(data: Record<string, string>, passphrase: string) {
    let paramString = Object.keys(data)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
        .join("&");

    if (passphrase) {
        paramString += `&passphrase=${encodeURIComponent(passphrase)}`;
    }

    return crypto.createHash("md5").update(paramString).digest("hex");
}
