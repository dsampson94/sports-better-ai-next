"use client";

import { useEffect, useState } from "react";

export interface UserProfile {
    _id: string;
    email: string;
    username?: string;
    role: string;
    balance: number;
    subscriptionStatus: string;
    subscriptionPlan: string;
    autoRenew: boolean;
    usageCountThisMonth: number;
    freePredictionCount: number;
    aiCallAllowance: number;
    createdAt: string;
    updatedAt: string;
}

export default function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch("/api/user/me", { credentials: "include" });
                if (res.ok) {
                    const data: UserProfile = await res.json();
                    setUserProfile(data);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setIsAuthenticated(false);
            } finally {
                setProfileLoading(false);
            }
        }
        fetchUserProfile();
    }, []);

    return { isAuthenticated, profileLoading, userProfile, setUserProfile };
}
