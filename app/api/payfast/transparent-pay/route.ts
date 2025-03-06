import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

function generateSignature(data: Record<string, string>, passphrase?: string) {
    const paramOrder = [
        "merchant_id",
        "merchant_key",
        "return_url",
        "cancel_url",
        "notify_url",
        "name_first",
        "name_last",
        "email_address",
        "m_payment_id",
        "amount",
        "item_name",
        // Optionally include card details in signature if required:
        "card_number",
        "card_expiry",
        "card_cvv",
    ];
    let paramString = "";
    for (const key of paramOrder) {
        if (data[key]) {
            const encoded = encodeURIComponent(data[key].trim()).replace(/%20/g, "+");
            paramString += `${key}=${encoded}&`;
        }
    }
    if (paramString.endsWith("&")) {
        paramString = paramString.slice(0, -1);
    }
    if (passphrase) {
        const passEncoded = encodeURIComponent(passphrase.trim()).replace(/%20/g, "+");
        paramString += `&passphrase=${passEncoded}`;
    }
    return crypto.createHash("md5").update(paramString).digest("hex");
}

export async function POST(req: NextRequest) {
    try {
        const { plan, cardDetails, amount, orderId, itemName } = await req.json();

        // Prepare payment data required by PayFast.
        // Replace static placeholders with real user details if available.
        const data: Record<string, string> = {
            merchant_id: process.env.PAYFAST_MERCHANT_ID!,
            merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=cancelled`,
            notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/notify`,
            name_first: "John",
            name_last: "Doe",
            email_address: "john.doe@example.com",
            m_payment_id: orderId,
            amount: Number(amount).toFixed(2),
            item_name: itemName,
            // Now add card details to the data payload.
            card_number: cardDetails.cardNumber,
            card_expiry: cardDetails.expiry,
            card_cvv: cardDetails.cvv,
        };

        // Generate the signature (including card details if required).
        data.signature = generateSignature(data, process.env.PAYFAST_PASSPHRASE);

        // Convert the data to URL-encoded form string.
        const formData = new URLSearchParams(data).toString();

        // Select the appropriate PayFast URL (sandbox vs live)
        const payfastUrl =
            process.env.PAYFAST_ENVIRONMENT === "live"
                ? "https://www.payfast.co.za/eng/process"
                : "https://sandbox.payfast.co.za/eng/process";

        // Perform a server-to-server POST request to PayFast.
        const payfastResponse = await axios.post(payfastUrl, formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        // Process PayFast's response.
        if (payfastResponse.status === 200) {
            return NextResponse.json({ success: true, message: "Payment processed successfully." });
        } else {
            return NextResponse.json({ success: false, error: "Payment failed." }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Transparent Payment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
