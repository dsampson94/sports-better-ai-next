// app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { orderID } = await req.json();
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

        // Capture the order
        const captureResponse = await axios.post(
            `${ baseUrl }/v2/checkout/orders/${ orderID }/capture`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ accessToken }`,
                },
            }
        );

        // Optionally, update user's token allowance in your DB here
        return NextResponse.json({ captureData: captureResponse.data });
    } catch (error: any) {
        console.error('PayPal Order Capture Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
