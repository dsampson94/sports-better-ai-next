import React, { ReactNode } from 'react';
import { Metadata } from 'next';

interface LayoutProps {
    children: ReactNode;
}

export const metadata: Metadata = {
    title: "Sports Better",
    description: "AI-driven sports predictions with real-time analysis",
};

const Layout = ({ children }: LayoutProps) => {
    return <>{children}</>;
}

export default Layout;
