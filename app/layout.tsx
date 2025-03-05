import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

const spaceGrotesk = Space_Grotesk({
    variable: '--font-space-grotesk',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: '--font-ibm-mono',
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
    title: 'Sports Better',
    description: 'AI-driven sports predictions with real-time analysis',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased bg-gray-900 text-white`}
        >
        {children}
        <Analytics />
        </body>
        </html>
    );
}
