'use client';

import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface SubscriptionModalProps {
    onClose: () => void;
}

const plans = {
    basic: { price: 5, aiCalls: 20 },
    standard: { price: 10, aiCalls: 40 },
    premium: { price: 25, aiCalls: 100 },
};

const SubscriptionModal = ({ onClose }: SubscriptionModalProps) => {
    const handleSubscribe = async (plan: keyof typeof plans) => {
        const { price, aiCalls } = plans[plan];

        try {
            const response = await axios.post('/api/payfast/pay-now', {
                amount: price,
                itemName: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${aiCalls} AI Calls`,
                orderId: `sub-${plan}-${Date.now()}`,
            });

            const { actionUrl, formData } = response.data;

            const form = document.createElement('form');
            form.action = actionUrl;
            form.method = 'POST';

            Object.entries(formData).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value as string;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('Payment initialization error:', error);
            alert('An error occurred during payment initialization. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white shadow-xl rounded-xl max-w-lg w-full p-8 relative"
            >
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 transition"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-3xl font-semibold text-center mb-4">🚀 Upgrade Your Plan</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    Select a subscription plan below:
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {Object.entries(plans).map(([key, { price, aiCalls }]) => (
                        <button
                            key={key}
                            onClick={() => handleSubscribe(key as keyof typeof plans)}
                            className="w-full text-left flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 transition rounded-lg border border-gray-700"
                        >
                            <div>
                                <h3 className="text-lg font-semibold capitalize text-white">{key} Plan</h3>
                                <p className="text-sm text-gray-400">
                                    {aiCalls} AI Calls
                                </p>
                            </div>
                            <span className="text-lg font-semibold text-white">${price}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-300 transition"
                    >
                        Maybe Later
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SubscriptionModal;
