'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface GamePrediction {
    gameTitle: string;
    competition: string;
    winProbability: string;
    bestBet: string;
    fixtureDetails: string;
    recentForm: string;
    headToHead: string;
    injuryUpdates: string;
    homeAwayImpact: string;
    tacticalInsights: string;
    bettingMarketMovement: string;
    expertPredictions: string;
    characterization: string;
    overallRecommendation: string;
    fullText: string;
    citations?: string[];
}

interface PredictionResultsProps {
    loading: boolean;
    error: string | null;
    aggregatedIntro: string;
    predictions: GamePrediction[];
}

/**
 * Clean trailing dashes, spaces, and emoji characters from a value.
 * Adjust the Unicode ranges if your aggregator output contains other emoji.
 */
const cleanValue = (value: string): string => {
    return value.replace(/[-–]\s*[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/gu, '').trim();
};

export default function PredictionResults({
                                              loading,
                                              error,
                                              aggregatedIntro,
                                              predictions,
                                          }: PredictionResultsProps) {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {aggregatedIntro && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md mb-8"
                >
                    <h3 className="text-xl font-bold text-blue-300 mb-2">Overview</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{aggregatedIntro}</p>
                </motion.div>
            )}

            {predictions.map((prediction, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 p-6 rounded shadow-lg w-full"
                >
                    <h2 className="text-2xl font-bold text-blue-300 mb-1">
                        {(() => {
                            const regex = /^(.*?)\s*✅/;
                            const match = prediction.gameTitle.match(regex);
                            return match ? cleanValue(match[1].trim()) : prediction.gameTitle;
                        })()}
                    </h2>
                    {prediction.competition && (
                        <p className="text-sm text-gray-400 mb-3">
                            Competition: {cleanValue(prediction.competition)}
                        </p>
                    )}
                    <div className="mt-4">
                        <p className="text-gray-300">
                            <strong>Win Probability:</strong> {cleanValue(prediction.winProbability)}
                        </p>
                        <p className="text-gray-300">
                            <strong>Best Bet:</strong> {cleanValue(prediction.bestBet)}
                        </p>
                        <div className="mt-3">
                            <h4 className="text-lg font-semibold text-green-400">
                                Key Stats & Trends:
                            </h4>
                            <ul className="list-disc list-inside text-gray-300">
                                {[
                                    { title: '📅 Fixture Details', data: prediction.fixtureDetails },
                                    { title: '📊 Recent Form', data: prediction.recentForm },
                                    { title: '🔄 Head-to-Head Record', data: prediction.headToHead },
                                    { title: '🚑 Injury & Squad Updates', data: prediction.injuryUpdates },
                                    { title: '🌍 Home/Away Impact', data: prediction.homeAwayImpact },
                                    { title: '🔥 Tactical Insights', data: prediction.tacticalInsights },
                                    { title: '💰 Betting Market Movement', data: prediction.bettingMarketMovement },
                                    { title: '💡 Expert Predictions & Trends', data: prediction.expertPredictions },
                                    { title: '📝 Characterization', data: prediction.characterization },
                                    { title: '🎯 Overall Recommendation', data: prediction.overallRecommendation },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.03 }}
                                        className="p-4 rounded-lg border border-gray-700 bg-gray-900 shadow-md"
                                    >
                                        <h4 className="text-md font-semibold text-yellow-400">
                                            {item.title}:
                                        </h4>
                                        <p className="text-gray-300">{item.data ? cleanValue(item.data) : 'N/A'}</p>
                                    </motion.div>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {prediction.citations && prediction.citations.length > 0 && (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md mt-4"
                        >
                            <h3 className="text-lg font-bold mb-2 text-purple-400">
                                Citations
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                {prediction.citations.map((cite, cIdx) => (
                                    <li key={cIdx}>{cite}</li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
