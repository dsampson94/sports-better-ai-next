import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import querystring from "querystring";

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

        // Read raw body
        const rawBody = await req.text();
        console.log("🔔 Raw ITN Data:", rawBody);

        // Parse form data
        const data = querystring.parse(rawBody) as Record<string, string>;
        console.log("✅ Parsed ITN Data:", data);

        // Verify signature using updated generator that includes empty fields
        const passphrase = process.env.PAYFAST_PASSPHRASE || "";
        const expectedSignature = generateSignature(data, passphrase);
        if (data.signature !== expectedSignature) {
            console.error("❌ Invalid signature. Expected:", expectedSignature, "Received:", data.signature);
            return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
        }

        // Ensure payment status is COMPLETE
        if (data.payment_status !== "COMPLETE") {
            console.error("❌ Payment not completed:", data.payment_status);
            return NextResponse.json({ error: "Payment not completed" }, { status: 200 });
        }

        // Connect to DB and update user's balance
        await connectToDatabase();
        const user = await User.findOne({ email: data.email_address });
        if (!user) {
            console.error("❌ User not found for email:", data.email_address);
            return NextResponse.json({ error: "User not found" }, { status: 200 });
        }

        const amountPaid = parseFloat(data.amount_gross);
        if (isNaN(amountPaid)) {
            console.error("❌ Invalid amount_gross:", data.amount_gross);
            return NextResponse.json({ error: "Invalid amount" }, { status: 200 });
        }

        user.balance = (user.balance || 0) + amountPaid;
        await user.save();

        console.log(`✅ Updated balance for ${user.email}: New Balance = ${user.balance}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("❌ Error handling PayFast ITN:", error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}

// Updated Signature Generator using a fixed parameter order and including empty values
function generateSignature(data: Record<string, string>, passphrase: string) {
    // Fixed order per PayFast ITN docs
    const paramOrder = [
        "m_payment_id",
        "pf_payment_id",
        "payment_status",
        "item_name",
        "item_description",
        "amount_gross",
        "amount_fee",
        "amount_net",
        "custom_str1",
        "custom_str2",
        "custom_str3",
        "custom_str4",
        "custom_str5",
        "custom_int1",
        "custom_int2",
        "custom_int3",
        "custom_int4",
        "custom_int5",
        "name_first",
        "name_last",
        "email_address",
        "merchant_id"
    ];

    let paramString = "";
    for (const key of paramOrder) {
        // Always include the key even if its value is empty.
        const value = data[key] || "";
        // encode using encodeURIComponent and replace %20 with +
        paramString += `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}&`;
    }

    // Remove trailing ampersand
    if (paramString.endsWith("&")) {
        paramString = paramString.slice(0, -1);
    }

    // Append passphrase (if exists)
    if (passphrase) {
        paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(paramString).digest("hex");
}
