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

        // Read raw body data from PayFast
        const rawBody = await req.text();
        console.log("🔔 Raw ITN Data:", rawBody);

        // Parse raw body into object
        const data = querystring.parse(rawBody) as Record<string, string>;
        console.log("✅ Parsed ITN Data:", data);

        // Validate required fields
        if (!data.email_address) {
            console.error("❌ Missing email_address");
            return NextResponse.json({ error: "Missing email_address" }, { status: 400 });
        }

        // Verify PayFast signature
        const passphrase = process.env.PAYFAST_PASSPHRASE || "";
        const expectedSignature = generateSignature(data, passphrase);

        if (data.signature !== expectedSignature) {
            console.error("❌ Invalid signature - Expected:", expectedSignature, "Received:", data.signature);
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        // Ensure payment is COMPLETE before proceeding
        if (data.payment_status !== "COMPLETE") {
            console.error("❌ Payment not completed");
            return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: data.email_address });

        if (!user) {
            console.error("❌ User not found");
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get amount paid
        const amountPaid = parseFloat(data.amount_gross);
        if (isNaN(amountPaid)) {
            console.error("❌ Invalid amount_gross");
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Determine AI calls purchased based on amount
        let aiCallsPurchased = 0;
        if (amountPaid >= 5) aiCallsPurchased = 20;  // Example: $5 = 20 AI calls

        // ✅ Update User's AI Call Allowance & Balance
        user.balance += amountPaid;
        user.aiCallAllowance += aiCallsPurchased;
        await user.save();

        console.log(`✅ Updated user ${user.email}: Balance = $${user.balance}, AI Calls = ${user.aiCallAllowance}`);

        // ✅ Respond with success
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error("🚨 Error handling PayFast ITN:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ✅ Helper: Generate PayFast Signature
function generateSignature(data: Record<string, string>, passphrase: string) {
    const sortedKeys = Object.keys(data)
        .filter((key) => key !== "signature") // Exclude signature
        .sort(); // PayFast requires parameters in alphabetical order

    let paramString = sortedKeys.map((key) => `${key}=${data[key]}`).join("&");

    // Append passphrase if present
    if (passphrase) {
        paramString += `&passphrase=${passphrase}`;
    }

    return crypto.createHash("md5").update(paramString).digest("hex");
}
