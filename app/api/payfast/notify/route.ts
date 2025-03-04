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

        // Read raw ITN data as text (PayFast sends x-www-form-urlencoded)
        const rawBody = await req.text();
        console.log("🔔 Raw ITN Data:", rawBody);

        // Parse the raw body into an object
        const data = querystring.parse(rawBody) as Record<string, string>;
        console.log("✅ Parsed ITN Data:", data);

        // Check that email_address is present
        if (!data.email_address) {
            console.error("❌ Missing email_address in ITN data");
            return NextResponse.json({ error: "Missing email_address" }, { status: 200 });
        }
        console.log("✅ Retrieved email:", data.email_address);

        // Verify PayFast signature
        const passphrase = process.env.PAYFAST_PASSPHRASE || "";
        const expectedSignature = generateSignature(data, passphrase);
        if (data.signature !== expectedSignature) {
            console.error("❌ Invalid signature. Expected:", expectedSignature, "Received:", data.signature);
            return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
        }

        // Ensure payment was successful
        if (data.payment_status !== "COMPLETE") {
            console.error("❌ Payment not completed:", data.payment_status);
            return NextResponse.json({ error: "Payment not completed" }, { status: 200 });
        }

        // Connect to the database
        await connectToDatabase();

        // Find the user by the email address provided
        const user = await User.findOne({ email: data.email_address });
        if (!user) {
            console.error("❌ User not found for email:", data.email_address);
            return NextResponse.json({ error: "User not found" }, { status: 200 });
        }

        // Parse the paid amount from amount_gross
        const amountPaid = parseFloat(data.amount_gross);
        if (isNaN(amountPaid)) {
            console.error("❌ Invalid amount_gross:", data.amount_gross);
            return NextResponse.json({ error: "Invalid amount" }, { status: 200 });
        }

        // Update user's balance
        user.balance = (user.balance || 0) + amountPaid;
        await user.save();
        console.log(`✅ Updated balance for ${user.email}: New Balance = ${user.balance}`);

        // Respond with HTTP 200 OK to acknowledge receipt of ITN
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("❌ Error handling PayFast ITN:", error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}

// Helper: Generate PayFast signature using fixed parameter order including empty fields
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
        // Always include key even if its value is empty
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
