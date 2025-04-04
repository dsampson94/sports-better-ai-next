// app/layout.tsx
import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from './components/AuthProvider';

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: "--font-ibm-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
    title: "Sports Better",
    description: "AI-driven sports predictions with real-time analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <Script
                src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
                strategy="afterInteractive"
            />
            <title>Sports Better AI</title>
        </head>
        <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased bg-gray-900 text-white`}>
        <AuthProvider>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
        </body>
        </html>
    );
}
