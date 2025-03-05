import { useState } from 'react';

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
    fullText: string;
    citations?: string[];
    updatedBalance?: number;
    freePredictionCount?: number;
}

export function useAnalysis() {
    const [finalResult, setFinalResult] = useState<GamePrediction[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    async function analyze(userInput: string) {
        setLoading(true);
        setFinalResult(null);
        setError('');

        try {
            // Fetch web search data
            const webSearchRes = await fetch('/api/analysis/web-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput }),
            });
            const webSearchData = await webSearchRes.json();
            if (webSearchData.error) throw new Error(webSearchData.error);
            const perplexityData = webSearchData.perplexityData;

            // Fetch AI response analysis
            const responseAnalysisRes = await fetch('/api/analysis/response-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput, perplexityData }),
            });
            const responseAnalysisData = await responseAnalysisRes.json();
            if (responseAnalysisData.error) throw new Error(responseAnalysisData.error);
            const partialResponses = responseAnalysisData.partialResponses;

            // Fetch final aggregator
            const aggregatorRes = await fetch('/api/analysis/analysis-aggregator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput, perplexityData, partialResponses }),
            });
            const aggregatorData = await aggregatorRes.json();
            if (aggregatorData.error) throw new Error(aggregatorData.error);

            // Safely extract the final answer text
            let aggregated = '';
            if (
                aggregatorData &&
                typeof aggregatorData.finalAnswer === 'object' &&
                typeof aggregatorData.finalAnswer.finalAnswer === 'string'
            ) {
                aggregated = aggregatorData.finalAnswer.finalAnswer;
            } else if (typeof aggregatorData.finalAnswer === 'string') {
                aggregated = aggregatorData.finalAnswer;
            }
            aggregated = aggregated || '';

            console.log('📝 Full Aggregated Text:\n', aggregated);

            // Also capture citations from aggregator (shared among all games)
            const aggregatorCitations = aggregatorData.citations || [];
            console.log('🔗 Citations:', aggregatorCitations);

            // Split aggregated text into game blocks.
            // We assume each game block starts with "🏆 Game Title:"
            const gameBlocks = aggregated
                .split(/(?=🏆 Game Title:)/g)
                .map((b: string) => b.trim())
                .filter(Boolean);
            console.log('🔎 Game Blocks Found:', gameBlocks.length);
            gameBlocks.forEach((block, index) => {
                console.log(`Game Block ${index + 1}:\n${block}\n---------------------`);
            });

            // Helper to extract text between markers (no fallback text)
            function extractBetween(text: string, start: string, end: string | null): string {
                let pattern: RegExp;
                if (end) {
                    pattern = new RegExp(`${start}\\s*(.*?)\\s*(?=${end})`, 's');
                } else {
                    pattern = new RegExp(`${start}\\s*(.*)`, 's');
                }
                const match = text.match(pattern);
                return match ? match[1].trim() : '';
            }

            const predictions: GamePrediction[] = gameBlocks.map((block) => {
                const lines = block.split('\n');
                // Assume first line is like "**1. Italy vs Wales**"
                const firstLine = lines[0]?.trim() || '';
                const gameTitle = firstLine.replace(/^\*\*\d+\.\s/, '').replace(/\*\*$/, '').trim();

                // Extract Competition if available from any line starting with "Competition:"
                let competition = '';
                for (const line of lines) {
                    if (line.startsWith('Competition:')) {
                        competition = line.replace('Competition:', '').trim();
                        break;
                    }
                }

                // Start from "🏆 Final Prediction & Betting Insights:"
                const predictionIndex = block.indexOf('🏆 Final Prediction & Betting Insights:');
                const bulletSection = predictionIndex >= 0 ? block.slice(predictionIndex) : block;

                const winProbability = extractBetween(bulletSection, '- Win Probability:', '- Best Bet:');
                const bestBet = extractBetween(bulletSection, '- Best Bet:', '- Key Stats & Trends:');
                const fixtureDetails = extractBetween(bulletSection, '- 📅 Fixture Details:', '- 📊 Recent Form:');
                const recentForm = extractBetween(bulletSection, '- 📊 Recent Form:', '- 🔄 Head-to-Head');
                const headToHead = extractBetween(bulletSection, '- 🔄 Head-to-Head', '- 🚑 Injury Updates:');
                const injuryUpdates = extractBetween(bulletSection, '- 🚑 Injury Updates:', '- 🌍 Home/Away Impact:');
                const homeAwayImpact = extractBetween(bulletSection, '- 🌍 Home/Away Impact:', '- 🔥 Tactical Insights:');
                const tacticalInsights = extractBetween(bulletSection, '- 🔥 Tactical Insights:', '- 💰 Betting Market Movement:');
                const bettingMarketMovement = extractBetween(bulletSection, '- 💰 Betting Market Movement:', '- 📈 Expert Predictions');
                const expertPredictions = extractBetween(bulletSection, '- 📈 Expert Predictions', '- 📈 Characterization:');
                const characterization = extractBetween(bulletSection, '- 📈 Characterization:', null);

                return {
                    gameTitle,
                    competition,
                    winProbability,
                    bestBet,
                    fixtureDetails,
                    recentForm,
                    headToHead,
                    injuryUpdates,
                    homeAwayImpact,
                    tacticalInsights,
                    bettingMarketMovement,
                    expertPredictions,
                    characterization,
                    fullText: block,
                    citations: aggregatorCitations,
                };
            });

            console.log('🔄 Parsed Predictions:', predictions);

            // Update usage data
            const updateRes = await fetch('/api/user/update-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const updateData = await updateRes.json();
            if (updateData.error) {
                console.warn('⚠️ Usage update error:', updateData.error);
            }
            predictions.forEach((p) => {
                p.updatedBalance = updateData.updatedBalance ?? 0;
                p.freePredictionCount = updateData.freePredictionCount ?? 0;
            });

            setFinalResult(predictions);
        } catch (e: any) {
            setError(e.message || 'Error analyzing input.');
            console.error('❌ Analysis Error:', e.message);
        } finally {
            setLoading(false);
        }
    }

    return { finalResult, loading, error, analyze };
}
