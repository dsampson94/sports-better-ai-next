"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
    _id: string;
    email: string;
    username?: string;
    balance: number;
    freePredictionCount: number;
    aiCallAllowance: number;
    // Add any additional fields as needed
}

interface AuthContextProps {
    userProfile: UserProfile | null;
    isAuthenticated: boolean;
    profileLoading: boolean;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    userProfile: null,
    isAuthenticated: false,
    profileLoading: true,
    refreshUserProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    const refreshUserProfile = async () => {
        try {
            const res = await fetch("/api/user/me", { credentials: "include" });
            if (res.ok) {
                const data: UserProfile = await res.json();
                setUserProfile(data);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setUserProfile(null);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setIsAuthenticated(false);
            setUserProfile(null);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        refreshUserProfile();
    }, []);

    return (
        <AuthContext.Provider value={{ userProfile, isAuthenticated, profileLoading, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
