"use client";
import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SubscriptionModal from "./SubscriptionModal";
import useAuth from "../lib/hooks/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, profileLoading, userProfile } = useAuth();
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    const openSubscriptionModal = () => setShowSubscriptionModal(true);
    const closeSubscriptionModal = () => setShowSubscriptionModal(false);

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
        </div>
    );
}
