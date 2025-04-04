// app/components/AppLayout.tsx
"use client";
import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SubscriptionModal, { plans } from "./SubscriptionModal";
import { useAuth } from './AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { userProfile, isAuthenticated, profileLoading, refreshUserProfile } = useAuth();

    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);

    const openSubscriptionModal = () => setShowSubscriptionModal(true);
    const closeSubscriptionModal = () => {
        setSelectedPlan(null);
        setShowSubscriptionModal(false);
    };

    const handlePlanSelect = (planKey: keyof typeof plans | null) => {
        setSelectedPlan(planKey);
    };

    const handlePaymentSuccess = async () => {
        console.log("Payment successful!");
        // Refresh the shared profile state on successful payment
        await refreshUserProfile();
        setSelectedPlan(null);
        setShowSubscriptionModal(false);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-grow overflow-hidden">
                <Header
                    isAuthenticated={isAuthenticated}
                    profileLoading={profileLoading}
                    userProfile={userProfile}
                    refreshUserProfile={refreshUserProfile}
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
                    selectedPlan={selectedPlan}
                />
            )}
        </div>
    );
}
