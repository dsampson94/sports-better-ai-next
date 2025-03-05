import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import querystring from "querystring";
import axios from "axios";

// Disable Next.js body parsing for x-www-form-urlencoded data
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export async function POST(req: NextRequest) {
    try {
        console.log("🚀 Notify route called");

        // Read ITN data
        const rawBody = await req.text();
        console.log("🔔 Raw ITN Data:", rawBody);

        const data = querystring.parse(rawBody) as Record<string, string>;
        console.log("✅ Parsed ITN Data:", data);

        if (!data.email_address) {
            console.error("❌ Missing email_address");
            return NextResponse.json({ error: "Missing email_address" }, { status: 200 });
        }

        // Verify PayFast signature
        const passphrase = process.env.PAYFAST_PASSPHRASE || "";
        const expectedSignature = generateSignature(data, passphrase);
        if (data.signature !== expectedSignature) {
            console.error("❌ Invalid signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
        }

        if (data.payment_status !== "COMPLETE") {
            console.error("❌ Payment not completed");
            return NextResponse.json({ error: "Payment not completed" }, { status: 200 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: data.email_address });
        if (!user) {
            console.error("❌ User not found");
            return NextResponse.json({ error: "User not found" }, { status: 200 });
        }

        const amountPaid = parseFloat(data.amount_gross);
        if (isNaN(amountPaid)) {
            console.error("❌ Invalid amount_gross");
            return NextResponse.json({ error: "Invalid amount" }, { status: 200 });
        }

        // Call `update-subscription.ts` to handle the subscription update logic
        await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/update-subscription`, {
            amountPaid,
        }, {
            headers: { Cookie: `sportsbet_token=${req.cookies.get("sportsbet_token")?.value}` }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("❌ Error handling PayFast ITN:", error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}

// Helper: Generate PayFast signature
function generateSignature(data: Record<string, string>, passphrase: string) {
    const paramOrder = [
        "m_payment_id",
        "pf_payment_id",
        "payment_status",
        "item_name",
        "item_description",
        "amount_gross",
        "amount_fee",
        "amount_net",
        "name_first",
        "name_last",
        "email_address",
        "merchant_id"
    ];

    let paramString = "";
    for (const key of paramOrder) {
        const value = data[key] || "";
        paramString += `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}&`;
    }
    if (paramString.endsWith("&")) {
        paramString = paramString.slice(0, -1);
    }
    if (passphrase) {
        paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
    }
    return crypto.createHash("md5").update(paramString).digest("hex");
}
