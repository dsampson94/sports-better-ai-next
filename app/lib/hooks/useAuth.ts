"use client";

import { useEffect, useState } from "react";

export interface UserProfile {
    email: string;
    username?: string;
    balance: number;
    aiCallAllowance: number;
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
                    const data = await res.json();
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

    return { isAuthenticated, profileLoading, userProfile };
}
