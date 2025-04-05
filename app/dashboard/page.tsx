'use client';

import React, { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../lib/hooks/useAuth';
import { GamePrediction, useAnalysis } from '../lib/hooks/useAnalysis';
import PredictionResults from '../components/PredictionResults';

// Helper to extract a date from fixtureDetails – adjust the regex if needed.
const extractDate = (fixtureDetails: string): Date | null => {
    const regex = /(\w+\s+\d{1,2},\s+\d{4})/;
    const match = fixtureDetails.match(regex);
    return match && match[1] ? new Date(match[1]) : null;
};

export default function DashboardPage() {
    const { userProfile } = useAuth();
    const [query, setQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { finalResult, loading, error, analyze } = useAnalysis();

    // Determine if the user has a special admin username.
    const isDeltaAlpha = userProfile?.username === 'deltaalphavids';

    // Calculate total tokens available (free + purchased).
    const totalTokens =
        (userProfile?.freePredictionCount ?? 0) + (userProfile?.aiCallAllowance ?? 0);
    const isButtonDisabled = totalTokens <= 0;

    async function handleAnalyze(e: FormEvent) {
        e.preventDefault();
        setErrorMsg('');

        if (!userProfile?._id) {
            setErrorMsg('Error: User ID not found.');
            return;
        }
        if (isButtonDisabled) {
            setErrorMsg('No tokens available. Please purchase more.');
            return;
        }

        try {
            await analyze(query);
        } catch (err) {
            console.error('Error analyzing prediction:', err);
            setErrorMsg('Something went wrong. Please try again.');
        }
    }

    async function handleBestBets(e: FormEvent) {
        e.preventDefault();
        setErrorMsg('');

        if (!isDeltaAlpha) {
            setErrorMsg('Under Construction, come back soon!');
            return;
        }
        if (isButtonDisabled) {
            setErrorMsg('No tokens available. Please purchase more.');
            return;
        }
        await analyze('Get best bets');
    }

    // Filter predictions to only include upcoming games (future fixture date).
    const filteredPredictions = finalResult?.predictions.filter(prediction => {
        const gameDate = extractDate(prediction.fixtureDetails);
        // If date exists, include only if it's in the future; if no date, include by default.
        return gameDate ? gameDate.getTime() > Date.now() : true;
    }) || [];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex pt-24 flex-col font-sans">
            <main className="flex-1 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-full max-w-screen-xl mx-auto"
                >
                    {errorMsg && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-red-700 p-3 rounded mb-4 text-red-100 text-center"
                        >
                            {errorMsg}
                        </motion.div>
                    )}

                    {/* Token Display */}
                    <div className="mb-4 text-center text-sm text-gray-300">
                        <p>
                            <strong>Total Tokens Available:</strong> {totalTokens}
                        </p>
                    </div>

                    {/* Fixed Prompt Buttons */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <button
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-semibold text-sm"
                            onClick={() => {
                                setQuery('Upcoming games this week');
                                handleAnalyze(new Event('submit') as unknown as FormEvent);
                            }}
                            disabled={isButtonDisabled || loading}
                        >
                            Upcoming Games This Week
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-semibold text-sm"
                            onClick={handleBestBets}
                            disabled={loading}
                        >
                            Get Best Bets
                        </button>
                    </div>

                    {/* Search Form for Custom Query */}
                    <form onSubmit={handleAnalyze} className="flex flex-col space-y-3 w-full mb-6">
                        <motion.textarea
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-colors ease-in-out duration-150 w-full"
                            rows={1}
                            placeholder='Search by team, competition or date (e.g., "Chiefs vs Reds" or "Super Rugby")'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isButtonDisabled || loading}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                isButtonDisabled ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-green-600 hover:bg-green-500 text-white'
                            }`}
                        >
                            Get Predictions
                        </button>
                    </form>

                    {/* Prediction Results */}
                    {finalResult && finalResult.aggregatedIntro && (
                        <div className="space-y-8">
                            <PredictionResults
                                loading={loading}
                                error={error}
                                aggregatedIntro={finalResult.aggregatedIntro}
                                predictions={filteredPredictions}
                            />
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
