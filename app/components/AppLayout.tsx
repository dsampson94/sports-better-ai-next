'use client';
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import SubscriptionModal, { plans } from './SubscriptionModal';
import useAuth from '../lib/hooks/useAuth';

interface UserProfile {
    email: string;
    username?: string;
    balance: number;
    aiCallAllowance: number;
    freePredictionCount: number;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, profileLoading } = useAuth();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);

    const refreshUserProfile = async () => {
        try {
            const res = await fetch('/api/user/me');
            if (!res.ok) throw new Error('Failed to fetch user profile');
            const updatedUser = await res.json();
            setUserProfile(updatedUser);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        refreshUserProfile();
    }, [userProfile]);

    const openSubscriptionModal = () => setShowSubscriptionModal(true);
    const closeSubscriptionModal = () => {
        setSelectedPlan(null);
        setShowSubscriptionModal(false);
    };

    const handlePlanSelect = (planKey: keyof typeof plans | null) => {
        setSelectedPlan(planKey);
    };

    const handlePaymentSuccess = async () => {
        console.log('Payment successful!');
        await refreshUserProfile();
        setSelectedPlan(null);
        setShowSubscriptionModal(false);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-grow overflow-hidden">
                <Header
                    isAuthenticated={ isAuthenticated }
                    profileLoading={ profileLoading }
                    userProfile={ userProfile }
                    refreshUserProfile={ refreshUserProfile }
                    onOpenSubscriptionModal={ openSubscriptionModal }
                />
                <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6">
                    { children }
                </main>
                <Footer/>
            </div>
            { showSubscriptionModal && (
                <SubscriptionModal
                    onClose={ closeSubscriptionModal }
                    onPlanSelect={ handlePlanSelect }
                    onPaymentSuccess={ handlePaymentSuccess }
                    selectedPlan={ selectedPlan }
                />
            ) }
        </div>
    );
}
