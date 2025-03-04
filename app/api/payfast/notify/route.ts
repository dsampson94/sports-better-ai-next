import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';

export async function POST(req: NextRequest) {
    try {
        // ✅ 1. Parse PayFast response
        const formData = await req.formData();
        const data: Record<string, string> = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        console.log("🔔 PayFast Notification Received:", data);

        // ✅ 2. Verify Signature (Security Step)
        const payfastPassphrase = process.env.PAYFAST_PASSPHRASE!;
        const expectedSignature = generateSignature(data, payfastPassphrase);
        if (data.signature !== expectedSignature) {
            console.error("❌ Invalid signature received from PayFast");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // ✅ 3. Ensure Payment Was Successful
        if (data.payment_status !== "COMPLETE") {
            console.error("❌ Payment not completed:", data.payment_status);
            return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
        }

        // ✅ 4. Find User by Email (or Custom ID in `custom_str1`)
        await connectToDatabase();
        const user = await User.findOne({ email: data.email_address });

        if (!user) {
            console.error("❌ User not found:", data.email_address);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ 5. Update User’s Balance
        const amount = parseFloat(data.amount);
        user.balance = (user.balance ?? 0) + amount; // Ensure balance exists
        await user.save();

        console.log(`✅ Updated balance for ${user.email}: New Balance = ${user.balance}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Error handling PayFast IPN:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ✅ Signature Generator for PayFast
function generateSignature(data: Record<string, string>, passphrase: string) {
    let paramString = Object.keys(data)
        .filter((key) => key !== "signature" && data[key])
        .map((key) => `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}`)
        .join("&");

    if (passphrase) {
        paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(paramString).digest("hex");
}
