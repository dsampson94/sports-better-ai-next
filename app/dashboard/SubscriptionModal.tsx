'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SubscriptionModalProps {
    onClose: () => void;
}

const SubscriptionModal = ({ onClose }: SubscriptionModalProps) => {
    const merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY;
    const returnUrl = encodeURIComponent(`${ window.location.origin }/dashboard`);

    const plans = {
        basic: { price: 5, aiCalls: 20, duration: 1 },
        pro: { price: 10, aiCalls: 50, duration: 1 },
        premium: { price: 20, aiCalls: 100, duration: 1 },
    };

    const handlePayFastRedirect = (plan: keyof typeof plans) => {
        if (!merchantId || !merchantKey) {
            console.error('PayFast merchant details are missing.');
            return;
        }

        const { price } = plans[plan];
        window.location.href = `https://www.payfast.co.za/eng/process?merchant_id=${ merchantId }&merchant_key=${ merchantKey }&amount=${ price }&item_name=${ encodeURIComponent(plan) }+Plan&return_url=${ returnUrl }`;
    };

    return (
        <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
        >
            <motion.div
                initial={ { opacity: 0, y: -20 } }
                animate={ { opacity: 1, y: 0 } }
                exit={ { opacity: 0, y: -20 } }
                transition={ { duration: 0.3 } }
                className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full"
            >
                <h2 className="text-2xl font-bold mb-3">🚀 Upgrade Your Subscription</h2>
                <p className="text-gray-300 mb-4">
                    Get full access to premium AI betting insights.
                </p>

                <div className="space-y-3">
                    { Object.entries(plans).map(([key, { price, aiCalls }]) => (
                        <button
                            key={ key }
                            onClick={ () => handlePayFastRedirect(key as keyof typeof plans) }
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 rounded text-white transition"
                        >
                            { `${ key.charAt(0).toUpperCase() + key.slice(1) } - $${ price } for ${ aiCalls } AI Calls` }
                        </button>
                    )) }
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={ onClose }
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
                    >
                        Maybe Later
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SubscriptionModal;
