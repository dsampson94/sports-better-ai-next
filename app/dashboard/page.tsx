'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAnalysis } from '../lib/hooks/useAnalysis';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface UserProfile {
    email: string;
    username?: string;
    balance?: number;
    freePredictionCount?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const { finalResult, loading, analyze } = useAnalysis();

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch('/api/user/me');
                if (!res.ok) throw new Error('Unauthorized');
                const data = await res.json();
                setUserProfile(data);
            } catch (err) {
                console.error('Unauthorized access:', err);
                router.push('/login');
            } finally {
                setProfileLoading(false);
            }
        }
        fetchUserProfile();
    }, [router]);

    async function handleAnalyze(e: FormEvent) {
        e.preventDefault();
        setErrorMsg('');
        const freeCalls = userProfile?.freePredictionCount ?? 0;
        const balance = userProfile?.balance ?? 0;
        const costPerCall = 0.50;
        if (freeCalls >= 3 && balance < costPerCall) {
            setErrorMsg('You have used your free predictions and do not have enough balance. Please add credits.');
            return;
        }
        await analyze(query);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            {/* HEADER */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 p-4 flex justify-between items-center"
            >
                <div className="flex items-center space-x-4">
                    <img src="/logos/logo-brain.png" alt="SportsBetter AI Logo" className="h-12 w-12 object-contain" />
                    <h1 className="text-2xl font-bold text-green-400">SportsBetter AI 🏆</h1>
                </div>
                {profileLoading ? (
                    <span>Loading profile...</span>
                ) : userProfile ? (
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">
                            <p className="font-semibold">{userProfile.username || userProfile.email}</p>
                            <p className="text-gray-300">Credits: ${(userProfile.balance ?? 0).toFixed(2)}</p>
                            <p className="text-gray-300">Free Calls: {userProfile.freePredictionCount ?? 0} / 3</p>
                        </div>
                        <a href="/api/auth/logout" className="text-red-400 hover:text-red-500 transition">Logout</a>
                    </div>
                ) : (
                    <span className="text-red-400">No user data</span>
                )}
            </motion.header>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl font-semibold mb-4 text-center text-green-400">AI Sports Predictions ⚽🏀🎾</h2>
                    <p className="mb-4 text-gray-400 text-center">
                        Enter your query about upcoming matches. Our AI analyzes multiple models
                        and provides <strong>the best synthesized prediction.</strong>
                    </p>
                    {errorMsg && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-red-700 p-3 rounded mb-4 text-red-100 text-center"
                        >
                            {errorMsg}
                        </motion.div>
                    )}
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <motion.textarea
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                            rows={4}
                            placeholder="e.g. 'Who will win the next URC rugby match?'"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold w-full"
                        >
                            {loading ? 'Analyzing...' : 'Get AI Prediction'}
                        </motion.button>
                    </form>

                    {/* RESULTS SECTION */}
                    {finalResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 bg-gray-800 p-6 rounded space-y-6 shadow-lg"
                        >
                            {/* Final Prediction */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md"
                            >
                                <h3 className="text-xl font-bold mb-2 text-green-400">🏆 Final Prediction</h3>
                                <p className="text-gray-300"><strong>Win Probability:</strong> {finalResult.winProbability}</p>
                                <p className="text-gray-300"><strong>Best Bet:</strong> {finalResult.bestBet}</p>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            {/* FOOTER */}
            <footer className="bg-gray-800 p-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} SportsBetter AI
            </footer>
        </div>
    );
}
