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

/**
 * Cleans a string by removing:
 *  - Leading/trailing double-asterisks
 *  - Trailing dashes (or similar hyphen characters) plus whitespace
 *  - Trailing emoji characters (from common Unicode emoji ranges) optionally followed by colons/spaces
 *  - Leftover stars at the end
 */
function cleanValue(value: string): string {
    if (!value) return '';
    let cleaned = value;
    // Remove leading and trailing double asterisks
    cleaned = cleaned.replace(/^\*{2}|\*{2}$/g, '').trim();
    // Remove trailing dashes and whitespace
    cleaned = cleaned.replace(/[‐\-–]+\s*$/, '').trim();
    // Remove trailing emojis (covering common emoji Unicode ranges) and optional colon/spaces
    cleaned = cleaned.replace(
        /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+[:]*\s*$/u,
        ''
    ).trim();
    // Remove leftover stars at the end
    cleaned = cleaned.replace(/\*+$/g, '').trim();
    return cleaned;
}

interface PredictionResultsProps {
    loading: boolean;
    error: string | null;
    aggregatedIntro: string;
    predictions: GamePrediction[];
}

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
                    <p className="text-gray-300 whitespace-pre-wrap">{cleanValue(aggregatedIntro)}</p>
                </motion.div>
            )}

            {predictions.map((prediction, idx) => (
                <PredictionBlock key={idx} prediction={prediction} />
            ))}

            {predictions[0]?.citations && predictions[0].citations.length > 0 && (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md mt-4"
                >
                    <h3 className="text-lg font-bold mb-2 text-purple-400">Citations (All Games)</h3>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                        {predictions[0].citations.map((cite, cIdx) => (
                            <li key={cIdx}>{cite}</li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </div>
    );
}

interface PredictionBlockProps {
    prediction: GamePrediction;
}

const PredictionBlock = ({ prediction }: PredictionBlockProps) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const isIntroBlock = prediction.gameTitle.startsWith('🔮');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded shadow-lg w-full"
        >
            {/* Extract game title text up to the "✅" marker */}
            <h2 className="text-2xl font-bold text-blue-300 mb-1">
                {(() => {
                    const regex = /^(.*?)\s*✅/;
                    const match = prediction.gameTitle.match(regex);
                    return match ? cleanValue(match[1].trim()) : cleanValue(prediction.gameTitle);
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
                        ]
                            .filter(item => item.data && item.data.trim().length > 0)
                            .map((item, i) => (
                                <motion.li key={i} whileHover={{ scale: 1.03 }}>
                                    <strong>{item.title}:</strong> {cleanValue(item.data)}
                                </motion.li>
                            ))}
                    </ul>
                </div>
            </div>
            {prediction.citations && prediction.citations.length > 0 && (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md mt-4"
                >
                    <h3 className="text-lg font-bold mb-2 text-blue-400">📜 Full AI Response</h3>
                    <pre className="text-sm whitespace-pre-wrap text-gray-300">
            {prediction.fullText}
          </pre>
                </motion.div>
            )}
        </motion.div>
    );
};
