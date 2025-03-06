'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import useAuth from '../lib/hooks/useAuth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, profileLoading, userProfile } = useAuth();

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-grow overflow-hidden">
                <Header isAuthenticated={ isAuthenticated }
                        profileLoading={ profileLoading }
                        userProfile={ userProfile || undefined }/>
                <main className="flex-1 overflow-y-auto px-4 sm:px-6">
                    { children }
                </main>
                <Footer/>
            </div>
        </div>
    );
}
