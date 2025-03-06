// app/components/PayPalPaymentModal.tsx
"use client";
import React from "react";
import PayPalCheckoutButton from "./PayPalCheckoutButton";
import { plans } from "./SubscriptionModal";

interface PayPalPaymentModalProps {
    onClose: () => void;
    selectedPlan: keyof typeof plans;
    onPaymentSuccess: () => void;
}

const PayPalPaymentModal: React.FC<PayPalPaymentModalProps> = ({
                                                                   onClose,
                                                                   selectedPlan,
                                                                   onPaymentSuccess,
                                                               }) => {
    const plan = plans[selectedPlan];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                    Upgrade to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    PayPal will securely process your payment.
                </p>
                <PayPalCheckoutButton
                    amount={plan.price}
                    orderId={`sub-${selectedPlan}-${Date.now()}`}
                    itemName={`${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan - ${plan.aiCalls} AI Calls`}
                    onApprove={(orderID) => {
                        // Optionally update the user’s tokens on the back end here
                        onPaymentSuccess();
                        onClose();
                    }}
                />
                <button onClick={onClose} className="w-full mt-4 text-gray-500 hover:text-gray-700">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default PayPalPaymentModal;
