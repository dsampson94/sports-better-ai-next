import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AppLayout from "./components/AppLayout";

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

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased bg-gray-900 text-white`}
        >
        <AppLayout>{children}</AppLayout>
        <Analytics />
        <SpeedInsights />
        </body>
        </html>
    );
}
