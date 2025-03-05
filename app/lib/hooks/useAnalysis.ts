import { useState } from "react";

// Each game’s data structure
export interface GamePrediction {
    gameTitle: string;                // e.g. "Ireland vs France"
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
    fullText: string; // raw text for that game block
    updatedBalance?: number;
    freePredictionCount?: number;
}

export function useAnalysis() {
    // finalResult is now an array of GamePrediction objects
    const [finalResult, setFinalResult] = useState<GamePrediction[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    async function analyze(userInput: string) {
        setLoading(true);
        setFinalResult(null);
        setError("");

        try {
            console.log("🔍 Step 1: Fetching web search data...");
            const webSearchRes = await fetch("/api/analysis/web-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput }),
            });
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

            // 1) Log aggregatorData for debugging
            console.log("🔎 aggregatorData:", JSON.stringify(aggregatorData, null, 2));

            // 2) The aggregator route returns finalAnswer
            //    which is the full text containing multiple game predictions
            const fullResponse: string = aggregatorData.finalAnswer || "No full response available";

            console.log("📝 Full Aggregated Text:\n", fullResponse);

            // 3) Split the text into an array of game blocks based on heading "## "
            //    We expect each game block to start with lines like: "## Ireland vs France"
            //    The first element might be empty if there's text before the first "##"
            const rawBlocks = fullResponse.split(/^## /gm).map(block => block.trim()).filter(Boolean);

            // Helper function to extract bullet data from each block
            function extractBetween(block: string, start: string, end: string | null) {
                // If 'end' is provided, parse until that. Otherwise, parse until the end of the block
                const pattern = end
                    ? new RegExp(start + "\\s*(.*?)\\s*(?=" + end + ")", "s")
                    : new RegExp(start + "\\s*(.*)", "s");
                const match = block.match(pattern);
                return match ? match[1].trim() : "No data available";
            }

            // Parse each block into a structured object
            const predictions: GamePrediction[] = rawBlocks.map((block) => {
                // The first line in `block` is typically "Ireland vs France" or "England vs Italy" etc.
                // So let's extract the first line as the gameTitle:
                const lines = block.split("\n");
                const gameTitle = lines[0]?.trim() || "No Title";

                // After that line, we expect the bullet points
                // We'll do a more general approach:
                // We'll isolate the text after "🏆 Final Prediction & Betting Insights:"
                // so the bullet lines are consistent with aggregator's format.
                const predictionSection = block.split("🏆 Final Prediction & Betting Insights:")[1] || block;

                // Now extract each bullet
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

            console.log("🔄 Predictions parsed from aggregator text:", predictions);

            // 4) Update usage (balance/free calls)
            const updateRes = await fetch("/api/user/update-usage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const updateData = await updateRes.json();
            if (updateData.error) {
                console.warn("⚠️ Warning: Failed to update usage:", updateData.error);
            }

            // Add updatedBalance/freePredictionCount to each game
            predictions.forEach((pred) => {
                pred.updatedBalance = updateData.updatedBalance ?? 0;
                pred.freePredictionCount = updateData.freePredictionCount ?? 0;
            });

            console.log("✅ Final result set successfully!");
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
