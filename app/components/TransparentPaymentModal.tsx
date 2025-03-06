'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { plans } from './SubscriptionModal';

interface TransparentPaymentModalProps {
    onClose: () => void;
    selectedPlan: keyof typeof plans;
}

const TransparentPaymentModal: React.FC<TransparentPaymentModalProps> = ({ onClose, selectedPlan }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const plan = plans[selectedPlan];

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/payfast/transparent-pay', {
                plan,
                cardDetails: {
                    cardNumber,
                    expiry,
                    cvv,
                },
                amount: plan.price,
                orderId: `sub-${ selectedPlan }-${ Date.now() }`,
                itemName: `${ selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) } Plan - ${ plan.aiCalls } AI Calls`,
            });
            console.log('Payment success:', response.data);
            onClose();
        } catch (err: any) {
            console.error('Payment error:', err);
            setError('Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white text-gray-900 rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Upgrade
                    to { selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) } Plan</h2>
                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Card Number</label>
                    <input
                        type="text"
                        value={ cardNumber }
                        onChange={ (e) => setCardNumber(e.target.value) }
                        className="w-full border p-2 rounded"
                        placeholder="1234 5678 9012 3456"
                    />
                </div>
                <div className="mb-4 flex space-x-2">
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">Expiry Date</label>
                        <input
                            type="text"
                            value={ expiry }
                            onChange={ (e) => setExpiry(e.target.value) }
                            className="w-full border p-2 rounded"
                            placeholder="MM/YY"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">CVV</label>
                        <input
                            type="text"
                            value={ cvv }
                            onChange={ (e) => setCvv(e.target.value) }
                            className="w-full border p-2 rounded"
                            placeholder="123"
                        />
                    </div>
                </div>
                { error && <p className="text-red-500 mb-2">{ error }</p> }
                <button
                    onClick={ handlePayment }
                    disabled={ loading }
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
                >
                    { loading ? 'Processing...' : `Pay $${ plan.price } for ${ selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) } Plan` }
                </button>
                <button onClick={ onClose } className="w-full mt-4 text-gray-500 hover:text-gray-700">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default TransparentPaymentModal;
