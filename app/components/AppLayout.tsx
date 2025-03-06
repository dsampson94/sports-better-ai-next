// app/components/AppLayout.tsx
'use client';

import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SubscriptionModal, { plans } from "./SubscriptionModal";
import useAuth from "../lib/hooks/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, profileLoading, userProfile } = useAuth();
    // Modal state stored in layout so header (or any child) can trigger it
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);

    // Function to open the subscription modal
    const openSubscriptionModal = () => setShowSubscriptionModal(true);
    // Function to close the subscription modal
    const closeSubscriptionModal = () => setShowSubscriptionModal(false);

    // Handler for when a plan is selected within the modal
    const handlePlanSelect = (planKey: keyof typeof plans) => {
        setSelectedPlan(planKey);
        // Optionally, you can close the modal immediately if you want to switch to a payment view:
        // setShowSubscriptionModal(false);
    };

    // Handler for when a payment is successfully processed
    const handlePaymentSuccess = () => {
        console.log("Payment successful!");
        // Reset the selected plan and close the modal
        setSelectedPlan(null);
        setShowSubscriptionModal(false);
        // Optionally, you can also trigger a user profile refresh here.
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-grow overflow-hidden">
                <Header
                    isAuthenticated={isAuthenticated}
                    profileLoading={profileLoading}
                    userProfile={userProfile || undefined}
                    onOpenSubscriptionModal={openSubscriptionModal}
                />
                <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6">
                    {children}
                </main>
                <Footer />
            </div>
            {showSubscriptionModal && (
                <SubscriptionModal
                    onClose={closeSubscriptionModal}
                    onPlanSelect={handlePlanSelect}
                    onPaymentSuccess={handlePaymentSuccess}
                    selectedPlan={selectedPlan || undefined}
                />
            )}
        </div>
    );
}
