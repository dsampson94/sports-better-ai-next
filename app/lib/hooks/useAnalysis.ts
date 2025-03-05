import { useState } from "react";

// Define the structured response type
interface AnalysisResult {
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
    updatedBalance?: number;
    freePredictionCount?: number;
}

export function useAnalysis() {
    const [finalResult, setFinalResult] = useState<AnalysisResult | null>(null);
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

            console.log("🔄 Step 4: Mapping aggregated response...");
            const structuredResponse: AnalysisResult = {
                winProbability: aggregatorData["Win Probability"] || "No data available",
                bestBet: aggregatorData["Best Bet"] || "No data available",
                fixtureDetails: aggregatorData["Fixture Details"] || "No data available",
                recentForm: aggregatorData["Recent Form"] || "No data available",
                headToHead: aggregatorData["Head-to-Head Record"] || "No data available",
                injuryUpdates: aggregatorData["Injury & Squad Updates"] || "No data available",
                homeAwayImpact: aggregatorData["Home/Away Impact"] || "No data available",
                tacticalInsights: aggregatorData["Tactical Insights"] || "No data available",
                bettingMarketMovement: aggregatorData["Betting Market Movement"] || "No data available",
                expertPredictions: aggregatorData["Expert Predictions"] || "No data available",
                characterization: aggregatorData["Characterization"] || "No data available",
            };

            console.log("💰 Step 5: Updating user balance and free prediction count...");
            const updateRes = await fetch("/api/user/update-usage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const updateData = await updateRes.json();
            if (updateData.error) {
                console.warn("⚠️ Warning: Failed to update usage:", updateData.error);
            }

            // Merge updated balance and free prediction count into the structured response
            structuredResponse.updatedBalance = updateData.updatedBalance ?? 0;
            structuredResponse.freePredictionCount = updateData.freePredictionCount ?? 0;

            console.log("✅ Final result set successfully!");
            setFinalResult(structuredResponse);
        } catch (e: any) {
            setError(e.message || "Error analyzing input.");
            console.error("❌ Analysis Error:", e.message);
        } finally {
            setLoading(false);
        }
    }

    return { finalResult, loading, setLoading, error, analyze };
}
