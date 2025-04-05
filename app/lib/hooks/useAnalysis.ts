'use client';

import { useState, useCallback } from 'react';
import useAuth from './useAuth';

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
    aiCallAllowance?: number;
}

export interface AnalysisResult {
    predictions: GamePrediction[];
    aggregatedIntro: string;
}

/**
 * Ordered list of fields and their markers.
 * This schema defines the exact order and expected markers (including emojis)
 * that your aggregator output must follow.
 */
const fieldSchema = [
    { key: 'gameTitle', marker: '🏆 Game Title:' },
    { key: 'competition', marker: 'Competition:' },
    { key: 'winProbability', marker: 'Win Probability (%):' },
    { key: 'bestBet', marker: 'Best Bet:' },
    { key: 'fixtureDetails', marker: '📅 Fixture Details:' },
    { key: 'recentForm', marker: '📊 Recent Form:' },
    { key: 'headToHead', marker: '🔄 Head-to-Head Record:' },
    { key: 'injuryUpdates', marker: '🚑 Injury & Squad Updates:' },
    { key: 'homeAwayImpact', marker: '🌍 Home/Away Impact:' },
    { key: 'tacticalInsights', marker: '🔥 Tactical Insights:' },
    { key: 'bettingMarketMovement', marker: '💰 Betting Market Movement:' },
    { key: 'expertPredictions', marker: '💡 Expert Predictions & Trends:' },
    { key: 'characterization', marker: '📝 Characterization:' },
    { key: 'overallRecommendation', marker: '🎯 Overall Recommendation:' },
];

/**
 * Parses the aggregator output into a structured AnalysisResult.
 * It splits the text into an intro section and then game blocks.
 * Each game block is processed by walking through our field schema.
 */
function parseAggregatorOutput(aggregated: string, citations: string[] = []): AnalysisResult {
    const splitIndex = aggregated.indexOf('🏆 Game Title:');
    const aggregatedIntro = splitIndex !== -1 ? aggregated.slice(0, splitIndex).trim() : '';
    const gameText = splitIndex !== -1 ? aggregated.slice(splitIndex) : aggregated;
    const gameBlocks = gameText.split(/(?=🏆 Game Title:)/g).map(b => b.trim()).filter(Boolean);

    const predictions: GamePrediction[] = gameBlocks.map(block => {
        const result: any = {};
        // Process each field in order:
        for (let i = 0; i < fieldSchema.length; i++) {
            const current = fieldSchema[i];
            const next = fieldSchema[i + 1];
            // Create a regex to capture text between current marker and next marker (or end of block)
            const regex = next
                ? new RegExp(`${current.marker}\\s*(.*?)\\s*(?=${next.marker})`, 's')
                : new RegExp(`${current.marker}\\s*(.*)`, 's');
            const match = block.match(regex);
            result[current.key] = match ? match[1].trim() : 'N/A';
        }
        result.fullText = block;
        result.citations = citations;
        return result;
    });

    return { predictions, aggregatedIntro };
}

export function useAnalysis() {
    const { userProfile, setUserProfile } = useAuth();
    const [finalResult, setFinalResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deductAiCall = useCallback(async (): Promise<boolean> => {
        if (!userProfile?._id) {
            setError('User ID not found.');
            return false;
        }
        try {
            const updatedValues: Partial<{ freePredictionCount: number; aiCallAllowance: number }> = {};
            if (userProfile.freePredictionCount > 0) {
                updatedValues.freePredictionCount = userProfile.freePredictionCount - 1;
            } else if (userProfile.aiCallAllowance > 0) {
                updatedValues.aiCallAllowance = userProfile.aiCallAllowance - 1;
            } else {
                setError('No available AI calls left. Please purchase tokens.');
                return false;
            }
            const res = await fetch(`/api/user/${userProfile._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedValues),
            });
            const updatedUser = await res.json();
            if (!res.ok || updatedUser.error) {
                throw new Error(updatedUser.error || 'Failed to update AI calls.');
            }
            setUserProfile(updatedUser);
            return true;
        } catch (err) {
            console.error('❌ Error deducting AI call:', err);
            setError('Network error. Please try again.');
            return false;
        }
    }, [userProfile, setUserProfile]);

    const analyze = useCallback(async (userInput: string) => {
        setLoading(true);
        setFinalResult(null);
        setError(null);
        try {
            const hasCallsLeft = await deductAiCall();
            if (!hasCallsLeft) {
                throw new Error('No AI calls left. Please purchase tokens.');
            }
            const webSearchRes = await fetch('/api/analysis/web-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput }),
            });
            const webSearchData = await webSearchRes.json();
            if (webSearchData.error) throw new Error(webSearchData.error);
            const perplexityData = webSearchData.perplexityData;

            const responseAnalysisRes = await fetch('/api/analysis/response-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput, perplexityData }),
            });
            const responseAnalysisData = await responseAnalysisRes.json();
            if (responseAnalysisData.error) throw new Error(responseAnalysisData.error);
            const partialResponses = responseAnalysisData.partialResponses;

            const aggregatorRes = await fetch('/api/analysis/analysis-aggregator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput, perplexityData, partialResponses }),
            });
            const aggregatorData = await aggregatorRes.json();
            if (aggregatorData.error) throw new Error(aggregatorData.error);

            const aggregated =
                aggregatorData.finalAnswer?.finalAnswer || aggregatorData.finalAnswer || '';
            // Parse aggregator text into structured predictions
            const analysisResult = parseAggregatorOutput(aggregated, aggregatorData.citations || []);
            setFinalResult(analysisResult);
        } catch (err: any) {
            setError(err.message || 'Error analyzing input.');
            console.error('❌ Analysis Error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [deductAiCall, userProfile]);

    return { finalResult, loading, error, analyze };
}
