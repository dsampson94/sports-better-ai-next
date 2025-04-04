'use client';

import { useState, useCallback } from 'react';
import useAuth from './useAuth';

// Each game’s data structure
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

export function useAnalysis() {
    const { userProfile, setUserProfile } = useAuth();
    const [finalResult, setFinalResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Deducts AI calls before making the request.
     */
    const deductAiCall = useCallback(async (): Promise<boolean> => {
        if (!userProfile?._id) {
            setError('User ID not found.');
            return false;
        }

        try {
            // Determine which value to deduct first
            const updatedValues: Partial<{ freePredictionCount: number; aiCallAllowance: number }> = {};
            if (userProfile.freePredictionCount > 0) {
                updatedValues.freePredictionCount = userProfile.freePredictionCount - 1;
            } else if (userProfile.aiCallAllowance > 0) {
                updatedValues.aiCallAllowance = userProfile.aiCallAllowance - 1;
            } else {
                setError('No available AI calls left. Please purchase tokens.');
                return false;
            }

            // PATCH request to update user AI calls
            const res = await fetch(`/api/user/${userProfile._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedValues),
            });

            const updatedUser = await res.json();
            if (!res.ok || updatedUser.error) {
                throw new Error(updatedUser.error || 'Failed to update AI calls.');
            }

            // Update UI with new AI call allowance
            setUserProfile(updatedUser);
            return true;
        } catch (err) {
            console.error('❌ Error deducting AI call:', err);
            setError('Network error. Please try again.');
            return false;
        }
    }, [userProfile, setUserProfile]);

    /**
     * Fetch AI predictions.
     */
    const analyze = useCallback(async (userInput: string) => {
        setLoading(true);
        setFinalResult(null);
        setError(null);

        try {
            // Step 1: Ensure AI call allowance is available before proceeding
            const hasCallsLeft = await deductAiCall();
            if (!hasCallsLeft) {
                throw new Error('No AI calls left. Please purchase tokens.');
            }

            // Step 2: Web Search API Call
            const webSearchRes = await fetch('/api/analysis/web-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput }),
            });
            const webSearchData = await webSearchRes.json();
            if (webSearchData.error) throw new Error(webSearchData.error);
            const perplexityData = webSearchData.perplexityData;

            // Step 3: AI Response Analysis API Call
            const responseAnalysisRes = await fetch('/api/analysis/response-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput, perplexityData }),
            });
            const responseAnalysisData = await responseAnalysisRes.json();
            if (responseAnalysisData.error) throw new Error(responseAnalysisData.error);
            const partialResponses = responseAnalysisData.partialResponses;

            // Step 4: Final Aggregated Analysis
            const aggregatorRes = await fetch('/api/analysis/analysis-aggregator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput, perplexityData, partialResponses }),
            });
            const aggregatorData = await aggregatorRes.json();
            if (aggregatorData.error) throw new Error(aggregatorData.error);

            // Extract final answer
            let aggregated = aggregatorData.finalAnswer?.finalAnswer || aggregatorData.finalAnswer || '';

            // Step 5: Process AI Response and Structure Predictions
            const splitIndex = aggregated.indexOf('🏆 Game Title:');
            const introText = splitIndex !== -1 ? aggregated.slice(0, splitIndex).trim() : '';
            const gameText = splitIndex !== -1 ? aggregated.slice(splitIndex) : aggregated;

            const gameBlocks = gameText
                .split(/(?=🏆 Game Title:)/g)
                .map((b) => b.trim())
                .filter(Boolean);

            const extractBetween = (text: string, start: string, end?: string) => {
                const pattern = end
                    ? new RegExp(`${start}\\s*:?\\s*(.*?)\\s*(?=${end})`, 's')
                    : new RegExp(`${start}\\s*:?\\s*(.*)`, 's');
                return text.match(pattern)?.[1]?.trim() || '';
            };

            const predictions: GamePrediction[] = gameBlocks.map((block) => ({
                gameTitle: extractBetween(block, '🏆 Game Title:'),
                competition: extractBetween(block, 'Competition:', 'Win Probability'),
                winProbability: extractBetween(block, 'Win Probability', 'Best Bet'),
                bestBet: extractBetween(block, 'Best Bet:', 'Fixture Details'),
                fixtureDetails: extractBetween(block, 'Fixture Details:', 'Recent Form'),
                recentForm: extractBetween(block, 'Recent Form:', 'Head-to-Head'),
                headToHead: extractBetween(block, 'Head-to-Head Record:', 'Injury Updates'),
                injuryUpdates: extractBetween(block, 'Injury & Squad Updates:', 'Home/Away Impact'),
                homeAwayImpact: extractBetween(block, 'Home/Away Impact:', 'Tactical Insights'),
                tacticalInsights: extractBetween(block, 'Tactical Insights:', 'Betting Market Movement'),
                bettingMarketMovement: extractBetween(block, 'Betting Market Movement:', 'Expert Predictions & Trends'),
                expertPredictions: extractBetween(block, 'Expert Predictions & Trends:', 'Characterization'),
                characterization: extractBetween(block, 'Characterization:', 'Overall Recommendation'),
                overallRecommendation: extractBetween(block, 'Overall Recommendation'),
                fullText: block,
                citations: aggregatorData.citations || [],
                aiCallAllowance: userProfile?.aiCallAllowance ?? 0,
            }));

            setFinalResult({ predictions, aggregatedIntro: introText });
        } catch (err: any) {
            setError(err.message || 'Error analyzing input.');
            console.error('❌ Analysis Error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [deductAiCall, userProfile]);

    return { finalResult, loading, error, analyze };
}
