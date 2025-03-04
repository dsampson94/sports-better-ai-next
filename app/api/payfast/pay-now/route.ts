// app/api/payfast/pay-now/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, itemName, orderId } = body;

        // 1) Env vars
        const merchantId = process.env.PAYFAST_MERCHANT_ID!;
        const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
        const passphrase = process.env.PAYFAST_PASSPHRASE;
        const testingMode = process.env.PAYFAST_ENVIRONMENT !== "live";

        // 2) Build the data object (include only the fields you actually need)
        const data: Record<string, string> = {
            merchant_id: merchantId,
            merchant_key: merchantKey,
            return_url: `https://sports-better-ai-next-fetnnwkn8-saas-team-six.vercel.app/dashboard?payment=success`, // Update this
            cancel_url: `https://sports-better-ai-next-fetnnwkn8-saas-team-six.vercel.app/dashboard?payment=cancel`, // Update this
            notify_url: `https://sports-better-ai-next-fetnnwkn8-saas-team-six.vercel.app/api/payfast/notify`,
            name_first: "John",
            name_last: "Doe",
            email_address: "john.doe@example.com",
            m_payment_id: orderId || "unique-order-id",
            amount: Number(amount).toFixed(2),
            item_name: itemName || "Test Product",
            // custom_str1: "foo", etc., if you need them
        };

        // 3) Generate the signature in strict PayFast param order
        const signature = generateSignature(data, passphrase);
        data.signature = signature;

        // 4) Construct the correct URL
        const payfastHost = testingMode
            ? "https://sandbox.payfast.co.za/eng/process"
            : "https://www.payfast.co.za/eng/process";

        // 5) Return JSON for your front-end to build the hidden form
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
 * Generate a PayFast signature using the exact param order + 'spaces as plus (+)'
 * Order derived from PayFast docs: merchant_id, merchant_key, return_url, cancel_url, ...
 */
function generateSignature(data: Record<string, string>, passphrase?: string) {
    // 1) Param order from PayFast docs
    const paramOrder = [
        'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
        'name_first', 'name_last', 'email_address',
        'm_payment_id', 'amount', 'item_name',
        // If you have extra fields like custom_str1..5, frequency, subscription_type, etc., put them here in order
    ];

    // 2) Build param string in exact order, only if non-empty
    let paramString = '';
    for (const key of paramOrder) {
        if (data[key]) {
            // encode, then replace %20 with + to match PayFast's requirement
            const encoded = encodeURIComponent(data[key].trim()).replace(/%20/g, '+');
            paramString += `${key}=${encoded}&`;
        }
    }

    // remove trailing &
    if (paramString.endsWith('&')) {
        paramString = paramString.slice(0, -1);
    }

    // 3) Append passphrase if it exists in your PayFast dashboard
    if (passphrase) {
        const passEncoded = encodeURIComponent(passphrase.trim()).replace(/%20/g, '+');
        paramString += `&passphrase=${passEncoded}`;
    }

    // 4) MD5 hash
    return crypto.createHash('md5').update(paramString).digest('hex');
}
