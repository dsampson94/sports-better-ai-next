import { useState } from "react";

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
            const webSearchRes = await fetch("/api/analysis/web-search", { /* ... */ });
            const webSearchData = await webSearchRes.json();
            if (webSearchData.error) throw new Error(webSearchData.error);
            const perplexityData = webSearchData.perplexityData;

            console.log("🤖 Step 2: Fetching AI response analysis...");
            const responseAnalysisRes = await fetch("/api/analysis/response-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData }),
            });
            const responseAnalysisData = await responseAnalysisRes.json();
            if (responseAnalysisData.error) throw new Error(responseAnalysisData.error);
            const partialResponses = responseAnalysisData.partialResponses;

            console.log("📊 Step 3: Fetching final aggregated response...");
            const aggregatorRes = await fetch("/api/analysis/analysis-aggregator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData, partialResponses }),
            });
            const aggregatorData = await aggregatorRes.json();
            if (aggregatorData.error) throw new Error(aggregatorData.error);

            // aggregatorData.finalAnswer holds the combined text
            const fullResponse = aggregatorData.finalAnswer || "No full response available";
            console.log("📝 Full Aggregated Text:\n", fullResponse);

            // 4) Split on "## " to get multiple games
            const rawBlocks = fullResponse.split(/^## /gm).map((b) => b.trim()).filter(Boolean);

            // Helper to extract text between markers
            function extractBetween(block: string, start: string, end: string | null) {
                let pattern: RegExp;
                if (end) {
                    pattern = new RegExp(start + "\\s*(.*?)\\s*(?=" + end + ")", "s");
                } else {
                    pattern = new RegExp(start + "\\s*(.*)", "s");
                }
                const match = block.match(pattern);
                return match ? match[1].trim() : "No data available";
            }

            const predictions: GamePrediction[] = rawBlocks.map((block) => {
                // 1) Game title is first line
                const lines = block.split("\n");
                const gameTitle = lines[0]?.trim() || "No Title";

                // 2) Check for "Competition:" line
                let competition = "Unknown Competition";
                for (const line of lines) {
                    if (line.startsWith("Competition:")) {
                        competition = line.replace("Competition:", "").trim();
                        break;
                    }
                }

                // 3) Find "🏆 Final Prediction & Betting Insights:" portion
                const predictionSection = block.includes("🏆 Final Prediction & Betting Insights:")
                    ? block.split("🏆 Final Prediction & Betting Insights:")[1]
                    : block;

                // 4) Extract bullet points
                const winProbability = extractBetween(predictionSection, "- Win Probability:", "- Best Bet:");
                const bestBet = extractBetween(predictionSection, "- Best Bet:", "- Key Stats & Trends:");
                const fixtureDetails = extractBetween(predictionSection, "- 📅 Fixture Details:", "- 📊 Recent Form:");
                const recentForm = extractBetween(predictionSection, "- 📊 Recent Form:", "- 🔄 Head-to-Head");
                const headToHead = extractBetween(predictionSection, "- 🔄 Head-to-Head", "- 🚑 Injury Updates:");
                const injuryUpdates = extractBetween(predictionSection, "- 🚑 Injury Updates:", "- 🌍 Home/Away Impact:");
                const homeAwayImpact = extractBetween(predictionSection, "- 🌍 Home/Away Impact:", "- 🔥 Tactical Insights:");
                const tacticalInsights = extractBetween(predictionSection, "- 🔥 Tactical Insights:", "- 💰 Betting Market Movement:");
                const bettingMarketMovement = extractBetween(predictionSection, "- 💰 Betting Market Movement:", "- 📈 Expert Predictions");
                const expertPredictions = extractBetween(predictionSection, "- 📈 Expert Predictions", "- 📈 Characterization:");
                const characterization = extractBetween(predictionSection, "- 📈 Characterization:", null);

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
                };
            });

            // 5) Update usage
            const updateRes = await fetch("/api/user/update-usage", { method: "POST", headers: { "Content-Type": "application/json" } });
            const updateData = await updateRes.json();
            if (updateData.error) console.warn("⚠️ Failed to update usage:", updateData.error);

            predictions.forEach((p) => {
                p.updatedBalance = updateData.updatedBalance ?? 0;
                p.freePredictionCount = updateData.freePredictionCount ?? 0;
            });

            setFinalResult(predictions);
        } catch (e: any) {
            setError(e.message || "Error analyzing input.");
            console.error("❌ Analysis Error:", e.message);
        } finally {
            setLoading(false);
        }
    }

    return { finalResult, loading, error, analyze };
}
