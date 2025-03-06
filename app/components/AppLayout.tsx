"use client";

import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-grow overflow-hidden">
                <Header isAuthenticated={false} profileLoading={false}/>
                <main className="flex-grow overflow-y-auto">
                    { children }
                </main>
                <Footer/>
            </div>
        </div>
    );
}
