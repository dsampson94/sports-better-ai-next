// app/components/PayPalCheckoutButton.tsx
'use client';
import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalCheckoutButtonProps {
    amount: number;
    orderId: string;
    itemName: string;
    onApprove: (orderID: string) => void;
}

const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
                                                                       amount,
                                                                       orderId,
                                                                       itemName,
                                                                       onApprove,
                                                                   }) => {
    return (
        <PayPalScriptProvider options={ { clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: 'USD' } }>
            <PayPalButtons
                style={ { layout: 'vertical' } }
                createOrder={ (data, actions) => {
                    return fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount, orderId, itemName }),
                    })
                        .then((res) => res.json())
                        .then((data) => data.orderID);
                } }
                onApprove={ (data, actions) => {
                    return fetch('/api/paypal/capture-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderID: data.orderID }),
                    })
                        .then((res) => res.json())
                        .then(() => {
                            onApprove(data.orderID);
                        });
                } }
                onError={ (err) => {
                    console.error('PayPal Checkout onError', err);
                } }
            />
        </PayPalScriptProvider>
    );
};

export default PayPalCheckoutButton;
