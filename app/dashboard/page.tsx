"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAnalysis } from '../lib/hooks/useAnalysis';

interface UserProfile {
    email: string;
    username?: string;
    balance?: number;
}

export default function DashboardPage() {
    const [query, setQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);

    // Use our custom hook to perform analysis
    const { finalResult, loading, error, analyze } = useAnalysis();

    // 1) Fetch user data on mount
    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch("/api/user/me");
                if (!res.ok) {
                    throw new Error("Failed to fetch user profile");
                }
                const data = await res.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                setUserProfile(data);
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                setErrorMsg(err.message || "Error fetching profile");
            } finally {
                setProfileLoading(false);
            }
        }
        fetchUserProfile();
    }, []);

    // 2) Handle analysis submission using the hook
    async function handleAnalyze(e: FormEvent) {
        e.preventDefault();
        setErrorMsg("");
        await analyze(query);

        // Optionally update user profile with new balance if aggregator returns updatedBalance:
        // if (finalResult?.updatedBalance) {
        //   setUserProfile((prev) =>
        //     prev ? { ...prev, balance: finalResult.updatedBalance } : prev
        //   );
        // }
    }

    // 3) "Add Credits" – calls /api/payfast/pay-now to generate a form submission to add funds
    async function handleAddCredits() {
        try {
            const amount = 100.0; // e.g. top up 100 dollars
            const res = await fetch("/api/payfast/pay-now", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    itemName: `Top-up ${amount} dollars`,
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Build and auto-submit a hidden form to redirect to the payment gateway
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.actionUrl;
            for (const key in data.formData) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = data.formData[key];
                form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
        } catch (err: any) {
            console.error("Add Credits Error:", err.message);
            setErrorMsg(err.message);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* HEADER */}
            <header className="bg-gray-800 p-4 flex justify-between items-center relative">
                <h1 className="text-xl font-bold">SportsBetter AI 🏆</h1>
                <nav className="flex items-center space-x-4">
                    {profileLoading ? (
                        <span>Loading profile...</span>
                    ) : userProfile ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center space-x-2"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs">
                                    <span>U</span>
                                </div>
                                <div className="text-left text-sm">
                                    <p className="font-semibold">
                                        {userProfile.username || userProfile.email}
                                    </p>
                                    <p className="text-gray-300 text-xs">
                                        Credits: {userProfile.balance ?? 0}
                                    </p>
                                </div>
                                <svg
                                    className="w-4 h-4 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 text-sm rounded">
                                    <button
                                        onClick={handleAddCredits}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                                    >
                                        Add Credits
                                    </button>
                                    <hr className="border-gray-600" />
                                    <a
                                        href="/api/auth/logout"
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                                    >
                                        Logout
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-red-400">No user data</span>
                    )}
                </nav>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-4">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">AI Sports Predictions ⚽🏀🎾</h2>
                    <p className="mb-4 text-gray-400">
                        Enter your query about upcoming matches. Our AI compares multiple models and provides the{" "}
                        <strong>best synthesized prediction</strong>.
                    </p>

                    {errorMsg && (
                        <div className="bg-red-700 p-2 rounded mb-4 text-red-100">{errorMsg}</div>
                    )}

                    <form onSubmit={handleAnalyze} className="space-y-4">
            <textarea
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                rows={4}
                placeholder="e.g. 'Who will likely win the next URC rugby match?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold w-full"
                        >
                            {loading ? "Analyzing..." : "Get AI Prediction"}
                        </button>
                    </form>

                    {/* RESULT SECTION */}
                    {finalResult && (
                        <div className="mt-6 bg-gray-800 p-4 rounded space-y-4">
                            {finalResult.error && (
                                <p className="text-red-400">Error: {finalResult.error}</p>
                            )}
                            {!finalResult.error && (
                                <>
                                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                        <h3 className="text-lg font-bold mb-2 text-green-400">
                                            📊 Final AI Prediction
                                        </h3>
                                        <p className="text-gray-300 whitespace-pre-wrap">
                                            {finalResult.finalAnswer}
                                        </p>
                                    </div>

                                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                        <h3 className="text-lg font-bold mb-2 text-blue-400">
                                            🤖 AI Model Responses
                                        </h3>
                                        <pre className="text-sm whitespace-pre-wrap text-gray-300">
                      {JSON.stringify(finalResult.partialResponses, null, 2)}
                    </pre>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-gray-800 p-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} SportsBetter AI
            </footer>
        </div>
    );
}
