import { useState } from "react";

// Each game’s data structure
export interface GamePrediction {
    gameTitle: string; // e.g. "1. Italy vs Wales"
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
    updatedBalance?: number;
    freePredictionCount?: number;
}

export function useAnalysis() {
    const [finalResult, setFinalResult] = useState<GamePrediction[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    async function analyze(userInput: string) {
        setLoading(true);
        setFinalResult(null);
        setError("");

        try {
            // 1) Web search data
            const webSearchRes = await fetch("/api/analysis/web-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput }),
            });
            const webSearchData = await webSearchRes.json();
            if (webSearchData.error) throw new Error(webSearchData.error);
            const perplexityData = webSearchData.perplexityData;

            // 2) response-analysis
            const responseAnalysisRes = await fetch("/api/analysis/response-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData }),
            });
            const responseAnalysisData = await responseAnalysisRes.json();
            if (responseAnalysisData.error) throw new Error(responseAnalysisData.error);
            const partialResponses = responseAnalysisData.partialResponses;

            // 3) aggregator
            const aggregatorRes = await fetch("/api/analysis/analysis-aggregator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData, partialResponses }),
            });
            const aggregatorData = await aggregatorRes.json();
            if (aggregatorData.error) throw new Error(aggregatorData.error);

            // The combined text with multiple matches
            const fullResponse = aggregatorData.finalAnswer || "No response from Perplexity.";
            console.log("📝 Full Aggregated Text:\n", fullResponse);

            // If the aggregator text has lines like:
            // **1. Italy vs Wales**
            // 🏆 Final Prediction & Betting Insights:
            // ...
            // **2. England vs France**
            // 🏆 Final Prediction & Betting Insights:
            // ...
            //
            // We'll split on the pattern: /(?=\*\*\d+\.\s)/g
            // So each chunk is "1. Italy..." block, "2. England..." block, etc.
            const gameChunks = fullResponse
                .split(/(?=\*\*\d+\.\s)/g) // lookahead for "**1. ", "**2. "
                .map((c) => c.trim())
                .filter(Boolean);

            // A helper to extract bullet text
            function extractBetween(text: string, start: string, end: string | null) {
                let pattern: RegExp;
                if (end) {
                    pattern = new RegExp(`${start}\\s*(.*?)\\s*(?=${end})`, "s");
                } else {
                    pattern = new RegExp(`${start}\\s*(.*)`, "s");
                }
                const match = text.match(pattern);
                return match ? match[1].trim() : "No data available";
            }

            const predictions: GamePrediction[] = [];
            for (const chunk of gameChunks) {
                // 1) The first line might be "**1. Italy vs Wales**" or similar
                // so let's get the line up to the first newline
                const lines = chunk.split("\n");
                const firstLine = lines[0]?.trim() || "No Title";
                // e.g. "**1. Italy 🇮🇹 vs Wales 🏴**"
                const gameTitle = firstLine.replace(/^\*\*\d+\.\s/, "").replace(/\*\*$/, "").trim();

                // Check if there's a line "Competition:..."
                let competition = "Unknown Competition";
                for (const line of lines) {
                    if (line.startsWith("Competition:")) {
                        competition = line.replace("Competition:", "").trim();
                        break;
                    }
                }

                // 2) The bullet points are after "🏆 Final Prediction & Betting Insights:"
                const predictionIndex = chunk.indexOf("🏆 Final Prediction & Betting Insights:");
                if (predictionIndex < 0) {
                    // No bullet points found for this chunk
                    predictions.push({
                        gameTitle,
                        competition,
                        winProbability: "No data available",
                        bestBet: "No data available",
                        fixtureDetails: "No data available",
                        recentForm: "No data available",
                        headToHead: "No data available",
                        injuryUpdates: "No data available",
                        homeAwayImpact: "No data available",
                        tacticalInsights: "No data available",
                        bettingMarketMovement: "No data available",
                        expertPredictions: "No data available",
                        characterization: "No data available",
                        fullText: chunk,
                    });
                    continue;
                }

                // 3) isolate the bullet text
                const bulletSection = chunk.slice(predictionIndex);

                const winProbability = extractBetween(bulletSection, "- Win Probability:", "- Best Bet:");
                const bestBet = extractBetween(bulletSection, "- Best Bet:", "- Key Stats & Trends:");
                const fixtureDetails = extractBetween(bulletSection, "- 📅 Fixture Details:", "- 📊 Recent Form:");
                const recentForm = extractBetween(bulletSection, "- 📊 Recent Form:", "- 🔄 Head-to-Head");
                const headToHead = extractBetween(bulletSection, "- 🔄 Head-to-Head", "- 🚑 Injury Updates:");
                const injuryUpdates = extractBetween(bulletSection, "- 🚑 Injury Updates:", "- 🌍 Home/Away Impact:");
                const homeAwayImpact = extractBetween(bulletSection, "- 🌍 Home/Away Impact:", "- 🔥 Tactical Insights:");
                const tacticalInsights = extractBetween(bulletSection, "- 🔥 Tactical Insights:", "- 💰 Betting Market Movement:");
                const bettingMarketMovement = extractBetween(bulletSection, "- 💰 Betting Market Movement:", "- 📈 Expert Predictions");
                const expertPredictions = extractBetween(bulletSection, "- 📈 Expert Predictions", "- 📈 Characterization:");
                const characterization = extractBetween(bulletSection, "- 📈 Characterization:", null);

                predictions.push({
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
                    fullText: chunk,
                });
            }

            console.log("🔄 Predictions parsed from aggregator text:", predictions);

            // 4) Update usage
            const updateRes = await fetch("/api/user/update-usage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const updateData = await updateRes.json();
            if (updateData.error) {
                console.warn("⚠️ Failed to update usage:", updateData.error);
            }

            // Merge usage info
            predictions.forEach((p) => {
                p.updatedBalance = updateData.updatedBalance ?? 0;
                p.freePredictionCount = updateData.freePredictionCount ?? 0;
            });

            setFinalResult(predictions);
        } catch (err: any) {
            setError(err.message || "Error analyzing input.");
            console.error("❌ Analysis Error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    return { finalResult, loading, error, analyze };
}
