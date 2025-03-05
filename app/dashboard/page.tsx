"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAnalysis } from "../lib/hooks/useAnalysis";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UserProfile {
    email: string;
    username?: string;
    balance?: number;
    freePredictionCount?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);

    const { finalResult, loading, error, analyze } = useAnalysis();

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch("/api/user/me");
                if (!res.ok) {
                    throw new Error("Unauthorized");
                }
                const data = await res.json();
                setUserProfile(data);
            } catch (err) {
                console.error("Unauthorized access:", err);
                router.push("/login");
            } finally {
                setProfileLoading(false);
            }
        }
        fetchUserProfile();
    }, [router]);

    async function handleAnalyze(e: FormEvent) {
        e.preventDefault();
        setErrorMsg("");

        const freeCalls = userProfile?.freePredictionCount ?? 0;
        const balance = userProfile?.balance ?? 0;
        const costPerCall = 0.50;
        if (freeCalls >= 3 && balance < costPerCall) {
            setErrorMsg("You have used your free predictions and do not have enough balance. Please add credits.");
            return;
        }

        await analyze(query);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* HEADER */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 p-4 flex justify-between items-center"
            >
                <h1 className="text-xl font-bold">SportsBetter AI 🏆</h1>
                <nav>
                    <a href="/api/auth/logout" className="text-red-400 hover:text-red-500 transition">Logout</a>
                </nav>
            </motion.header>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-4">
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
                            placeholder="e.g. 'Who will likely win the next URC rugby match?'"
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
                            {loading ? "Analyzing..." : "Get AI Prediction"}
                        </motion.button>
                    </form>

                    {/* RESULT SECTION */}
                    {finalResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 bg-gray-800 p-4 rounded space-y-4 shadow-lg"
                        >
                            {finalResult.error ? (
                                <p className="text-red-400 text-center">{finalResult.error}</p>
                            ) : (
                                <>
                                    {/* 📊 Final AI Prediction */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md"
                                    >
                                        <h3 className="text-xl font-bold mb-2 text-green-400">
                                            📊 Final AI Prediction
                                        </h3>
                                        <p className="text-gray-300 whitespace-pre-wrap">
                                            {finalResult.finalAnswer}
                                        </p>
                                    </motion.div>

                                    {/* 🏆 Key Insights */}
                                    <div className="space-y-4">
                                        {finalResult.partialResponses?.map((resp: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg"
                                            >
                                                <h4 className="text-lg font-semibold text-blue-400">
                                                    ⚡ Model: {resp.id}
                                                </h4>
                                                <p className="text-gray-300">{resp.text}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* 📌 Detailed Breakdown */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        {[
                                            { title: "🏅 Win Probability", data: finalResult.winProbability },
                                            { title: "💰 Best Bet", data: finalResult.bestBet },
                                            { title: "📊 Team Form", data: finalResult.teamForm },
                                            { title: "🔄 Head-to-Head", data: finalResult.headToHead },
                                            { title: "🚑 Injury Updates", data: finalResult.injuryUpdates },
                                            { title: "🔥 Tactical Insights", data: finalResult.tactics },
                                        ].map((item, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md"
                                            >
                                                <h4 className="text-md font-semibold text-yellow-400">{item.title}</h4>
                                                <p className="text-gray-300">{item.data || "No data available"}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
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
