// app/components/AppLayout.tsx
'use client';
import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SubscriptionModal, { plans } from "./SubscriptionModal";
import useAuth from "../lib/hooks/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, profileLoading, userProfile } = useAuth();
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);

    const openSubscriptionModal = () => setShowSubscriptionModal(true);
    const closeSubscriptionModal = () => {
        setSelectedPlan(null); // Reset plan on close
        setShowSubscriptionModal(false);
    };

    // Handler for when a plan is selected within the modal
    const handlePlanSelect = (planKey: keyof typeof plans | null) => {
        setSelectedPlan(planKey);
    };

    // Handler for when a payment is successfully processed
    const handlePaymentSuccess = () => {
        console.log("Payment successful!");
        // Optionally trigger user profile refresh here.
        setSelectedPlan(null);
        setShowSubscriptionModal(false);
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
