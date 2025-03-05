import { useState } from "react";

// Each game’s data structure
export interface GamePrediction {
    gameTitle: string;               // e.g. "Ireland vs France"
    competition: string;            // If aggregator includes "Competition:..."
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
    fullText: string;               // The entire block for debugging
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
            console.log("🔍 Step 1: web-search...");
            const webSearchRes = await fetch("/api/analysis/web-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput }),
            });
            const webSearchData = await webSearchRes.json();
            if (webSearchData.error) throw new Error(webSearchData.error);
            const perplexityData = webSearchData.perplexityData;

            console.log("🤖 Step 2: response-analysis...");
            const responseAnalysisRes = await fetch("/api/analysis/response-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData }),
            });
            const responseAnalysisData = await responseAnalysisRes.json();
            if (responseAnalysisData.error) throw new Error(responseAnalysisData.error);
            const partialResponses = responseAnalysisData.partialResponses;

            console.log("📊 Step 3: aggregator...");
            const aggregatorRes = await fetch("/api/analysis/analysis-aggregator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData, partialResponses }),
            });
            const aggregatorData = await aggregatorRes.json();
            if (aggregatorData.error) throw new Error(aggregatorData.error);

            const fullResponse: string = aggregatorData.finalAnswer || "No full response available";
            console.log("📝 Full Aggregated Text:\n", fullResponse);

            // 1) Split into multiple blocks by searching for each occurrence of "🏆 Final Prediction & Betting Insights:"
            //    We'll keep the text from that marker onward for each game, but also need the lines above it for the game title
            const blocks = fullResponse
                .split(/(?=🏆 Final Prediction & Betting Insights:)/g)
                .map(b => b.trim())
                .filter(Boolean);

            // Helper to parse bullet points from each block
            function extractBetween(text: string, start: string, end: string | null) {
                let pattern: RegExp;
                if (end) {
                    pattern = new RegExp(start + "\\s*(.*?)\\s*(?=" + end + ")", "s");
                } else {
                    pattern = new RegExp(start + "\\s*(.*)", "s");
                }
                const match = text.match(pattern);
                return match ? match[1].trim() : "No data available";
            }

            const predictions: GamePrediction[] = [];

            // 2) For each block, we want the line(s) above "🏆 Final Prediction & Betting Insights:" to find e.g. "Ireland vs France"
            //    We'll find the preceding lines by splitting fullResponse around this block
            //    Alternatively, we can keep track of the chunk from the aggregator text
            let currentIndex = 0;
            blocks.forEach((block) => {
                // We find where this block starts in the fullResponse
                const blockStartIndex = fullResponse.indexOf(block, currentIndex);
                // We'll search backward for a newline, up to e.g. 2 lines above, to see if there's "Ireland vs France"
                // Or we can parse from aggregator text: aggregator might have a line "Ireland vs France" before "🏆 Final Prediction"
                let gameTitle = "No Title";
                let competition = "Unknown Competition";

                // We'll find the text before "🏆" to see if there's a match heading
                const beforeBlock = fullResponse.slice(currentIndex, blockStartIndex).trimEnd();
                // Typically, the aggregator might have something like "Ireland vs France" just above the "🏆" line
                // We'll get the last line of 'beforeBlock'
                const lines = beforeBlock.split("\n").map(l => l.trim()).filter(Boolean);
                const lastLine = lines[lines.length - 1] || "";
                // If it looks like a match heading, use it
                if (lastLine && lastLine.length < 120) {
                    // e.g. "Ireland vs France" or "🏴 Scotland vs 🏴 Wales" etc.
                    gameTitle = lastLine;
                }

                // Also check if aggregator includes a "Competition:" line anywhere above
                for (let i = lines.length - 1; i >= 0; i--) {
                    if (lines[i].startsWith("Competition:")) {
                        competition = lines[i].replace("Competition:", "").trim();
                        break;
                    }
                }

                // Now parse the bullet points from block
                const predictionSection = block; // The block starts with "🏆 Final Prediction..."
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
                    fullText: block,
                });

                // Move currentIndex to the end of this block
                currentIndex = blockStartIndex + block.length;
            });

            // 3) Update usage
            const updateRes = await fetch("/api/user/update-usage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const updateData = await updateRes.json();
            if (updateData.error) {
                console.warn("⚠️ Failed to update usage:", updateData.error);
            }
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
