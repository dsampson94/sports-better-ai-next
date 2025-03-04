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
        console.log("🚀 Notify route called");

        // Read the raw request body (PayFast sends form data)
        const rawBody = await req.text();
        console.log("🔔 Raw ITN Data:", rawBody);

        // Parse the raw body into an object
        const data = querystring.parse(rawBody) as Record<string, string>;
        console.log("✅ Parsed ITN Data:", data);

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

        // Parse the amount from PayFast; they send amount_gross as the full amount paid.
        const amountPaid = parseFloat(data.amount_gross);
        if (isNaN(amountPaid)) {
            console.error("❌ Invalid amount_gross:", data.amount_gross);
            return NextResponse.json({ error: "Invalid amount" }, { status: 200 });
        }

        // Atomically update the user's balance using $inc operator
        const updateResult = await User.updateOne(
            { email: data.email_address }, // Ensure the ITN sends the correct email
            { $inc: { balance: amountPaid } }
        );
        console.log("✅ Update Result:", updateResult);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("❌ Error handling PayFast ITN:", error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}

// Helper function to generate PayFast signature
function generateSignature(data: Record<string, string>, passphrase: string) {
    let paramString = Object.keys(data)
        .filter((key) => key !== "signature" && data[key])
        .sort() // Sorting keys alphabetically per PayFast requirements
        .map((key) => {
            // Encode and replace spaces with '+'
            return `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}`;
        })
        .join("&");

    if (passphrase) {
        paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(paramString).digest("hex");
}
