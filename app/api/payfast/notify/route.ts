import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import querystring from "querystring";

// Disable Next.js body parsing so we can handle x-www-form-urlencoded data
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export async function POST(req: NextRequest) {
    try {
        // Log that the notify route was hit
        console.log("🚀 Notify route called");

        // Read the raw request body as text
        const rawBody = await req.text();
        console.log("🔔 Raw ITN Data:", rawBody);

        // Parse the raw body (x-www-form-urlencoded)
        const data = querystring.parse(rawBody) as Record<string, string>;
        console.log("✅ Parsed ITN Data:", data);

        // Verify PayFast signature
        const passphrase = process.env.PAYFAST_PASSPHRASE || "";
        const expectedSignature = generateSignature(data, passphrase);
        if (data.signature !== expectedSignature) {
            console.error("❌ Invalid signature. Expected:", expectedSignature, "Received:", data.signature);
            // Return 200 OK even on error to prevent PayFast retries
            return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
        }

        // Ensure payment status is COMPLETE
        if (data.payment_status !== "COMPLETE") {
            console.error("❌ Payment not completed:", data.payment_status);
            return NextResponse.json({ error: "Payment not completed" }, { status: 200 });
        }

        // Connect to your database
        await connectToDatabase();

        // Identify the user.
        // IMPORTANT: Ensure your notify form passes a reliable identifier.
        // Here we use email_address, but you might consider a custom field.
        const user = await User.findOne({ email: data.email_address });
        if (!user) {
            console.error("❌ User not found for email:", data.email_address);
            return NextResponse.json({ error: "User not found" }, { status: 200 });
        }

        // Parse the amount that was paid. (PayFast sends amounts as decimals.)
        const amountPaid = parseFloat(data.amount_gross);
        if (isNaN(amountPaid)) {
            console.error("❌ Invalid amount_gross:", data.amount_gross);
            return NextResponse.json({ error: "Invalid amount" }, { status: 200 });
        }

        // Update user's balance
        user.balance = (user.balance || 0) + amountPaid;
        await user.save();

        console.log(`✅ Updated balance for ${user.email}: New Balance = ${user.balance}`);

        // Return HTTP 200 to acknowledge receipt of ITN
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("❌ Error handling PayFast ITN:", error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}

export async function GET(req: NextRequest) {
    console.log("GET request to /api/payfast/notify");
    console.log({req});
    return NextResponse.json({ message: "GET method not supported" }, { status: 405 });
}

// Helper: Generate PayFast signature
function generateSignature(data: Record<string, string>, passphrase: string) {
    // Build parameter string from all non-empty keys (excluding 'signature')
    // NOTE: PayFast docs recommend using alphabetical order here.
    let paramString = Object.keys(data)
        .filter((key) => key !== "signature" && data[key])
        .sort()
        .map((key) => {
            // Use encodeURIComponent and replace %20 with +
            return `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}`;
        })
        .join("&");

    if (passphrase) {
        paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(paramString).digest("hex");
}
