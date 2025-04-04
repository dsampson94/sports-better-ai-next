// app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';
import Transaction from '../../../lib/models/Transaction';

export async function POST(req: NextRequest) {
    try {
        const { orderID } = await req.json();
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        const baseUrl =
            process.env.PAYPAL_ENVIRONMENT === 'live'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

        // Step 1: Get access token from PayPal
        const authResponse = await axios({
            url: `${baseUrl}/v1/oauth2/token`,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            auth: { username: clientId!, password: clientSecret! },
            data: 'grant_type=client_credentials',
        });
        const accessToken = authResponse.data.access_token;

        // Step 2: Capture the order
        const captureResponse = await axios.post(
            `${baseUrl}/v2/checkout/orders/${orderID}/capture`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // Step 3: Retrieve the purchase details from the PayPal response
        const purchaseUnits = captureResponse.data.purchase_units;
        if (purchaseUnits && purchaseUnits.length > 0) {
            const amount = parseFloat(purchaseUnits[0].amount.value); // captured amount in USD

            // Define token tiers (adjust these values as needed)
            let tokensToAdd = 0;
            if (amount >= 25) tokensToAdd = 100;
            else if (amount >= 10) tokensToAdd = 40;
            else if (amount >= 5) tokensToAdd = 20;

            // Step 4: Retrieve user information from the session token
            const token = req.cookies.get("sportsbet_token")?.value;
            if (token) {
                let decoded: any;
                try {
                    decoded = jwt.verify(token, process.env.JWT_SECRET!);
                } catch (err) {
                    console.error("Invalid token", err);
                }
                if (decoded?.email) {
                    await connectToDatabase();
                    // Get the user document based on the email
                    const user = await User.findOne({ email: decoded.email });
                    if (user) {
                        // Update the user's token allowance atomically using $inc
                        await User.findByIdAndUpdate(
                            user._id,
                            { $inc: { aiCallAllowance: tokensToAdd } },
                            { new: true }
                        );
                        console.log(
                            `User ${decoded.email} credited with ${tokensToAdd} tokens for a $${amount} payment.`
                        );
                        // Create a transaction record to track the payment
                        await Transaction.create({
                            user: user._id,
                            amount: amount,
                            type: 'credit',
                            description: `PayPal payment capture: $${amount} received, ${tokensToAdd} tokens added.`,
                        });
                    }
                }
            }
        }

        return NextResponse.json({ captureData: captureResponse.data });
    } catch (error: any) {
        console.error('PayPal Order Capture Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
