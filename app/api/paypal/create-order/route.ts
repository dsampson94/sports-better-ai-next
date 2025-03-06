// app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { amount, orderId, itemName } = await req.json();
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        const baseUrl =
            process.env.PAYPAL_ENVIRONMENT === 'live'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

        // Get access token from PayPal
        const authResponse = await axios({
            url: `${ baseUrl }/v1/oauth2/token`,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            auth: { username: clientId!, password: clientSecret! },
            data: 'grant_type=client_credentials',
        });
        const accessToken = authResponse.data.access_token;

        // Build order payload
        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: orderId,
                    amount: {
                        currency_code: 'USD',
                        value: amount.toFixed(2),
                    },
                    description: itemName,
                },
            ],
            application_context: {
                return_url: `${ process.env.NEXT_PUBLIC_BASE_URL }/dashboard?payment=success`,
                cancel_url: `${ process.env.NEXT_PUBLIC_BASE_URL }/dashboard?payment=cancelled`,
            },
        };

        // Create the PayPal order
        const orderResponse = await axios.post(`${ baseUrl }/v2/checkout/orders`, orderPayload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ accessToken }`,
            },
        });

        // Extract approval URL and order ID
        const approvalUrl = orderResponse.data.links.find((link: any) => link.rel === 'approve')?.href;
        return NextResponse.json({ orderID: orderResponse.data.id, approvalUrl });
    } catch (error: any) {
        console.error('PayPal Order Creation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
