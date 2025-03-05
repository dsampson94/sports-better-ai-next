import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, itemName, orderId } = body;

        // 1) Env vars
        const merchantId = process.env.PAYFAST_MERCHANT_ID!;
        const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
        const passphrase = process.env.PAYFAST_PASSPHRASE;
        const testingMode = process.env.PAYFAST_ENVIRONMENT !== "live";

        // 2) Retrieve the user from the token (instead of hardcoded values)
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Use user's data: if username exists, split it for first and last name, otherwise split email.
        let name_first = "User";
        let name_last = "";
        if (user.username) {
            const parts = user.username.split(" ");
            name_first = parts[0];
            name_last = parts.slice(1).join(" ") || "";
        } else if (user.email) {
            // Split email at '@'
            name_first = user.email.split("@")[0];
            name_last = "";
        }
        const email_address = user.email;

        // 3) Build the data object (include only the fields you actually need)
        const data: Record<string, string> = {
            merchant_id: merchantId,
            merchant_key: merchantKey,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=cancelled`,
            notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/notify`,
            name_first,
            name_last,
            email_address,
            m_payment_id: orderId || "unique-order-id",
            amount: Number(amount).toFixed(2),
            item_name: itemName || "Test Product",
        };

        // 4) Generate the signature in strict PayFast param order
        data.signature = generateSignature(data, passphrase);

        // 5) Construct the correct URL
        const payfastHost = testingMode
            ? "https://sandbox.payfast.co.za/eng/process"
            : "https://www.payfast.co.za/eng/process";

        // 6) Return JSON for your front-end to build the hidden form
        return NextResponse.json({
            actionUrl: payfastHost,
            formData: data,
        });
    } catch (err: any) {
        console.error("Pay Now Route Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * Generate a PayFast signature using the exact param order + 'spaces as plus (+)'.
 * Order derived from PayFast docs: merchant_id, merchant_key, return_url, cancel_url, etc.
 */
function generateSignature(data: Record<string, string>, passphrase?: string) {
    // 1) Param order from PayFast docs
    const paramOrder = [
        'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
        'name_first', 'name_last', 'email_address',
        'm_payment_id', 'amount', 'item_name',
    ];

    // 2) Build param string in exact order, only if non-empty
    let paramString = "";
    for (const key of paramOrder) {
        if (data[key]) {
            const encoded = encodeURIComponent(data[key].trim()).replace(/%20/g, "+");
            paramString += `${key}=${encoded}&`;
        }
    }
    // Remove trailing '&'
    if (paramString.endsWith("&")) {
        paramString = paramString.slice(0, -1);
    }

    // 3) Append passphrase if available
    if (passphrase) {
        const passEncoded = encodeURIComponent(passphrase.trim()).replace(/%20/g, "+");
        paramString += `&passphrase=${passEncoded}`;
    }

    // 4) MD5 hash
    return crypto.createHash("md5").update(paramString).digest("hex");
}
