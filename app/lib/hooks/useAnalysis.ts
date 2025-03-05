import { useState } from "react";

// Define the structured response type with all bullet fields
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
    fullText: string; // the raw, full response text for debugging or fallback
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

            // Get the full aggregated text
            const fullResponse =
                aggregatorData.choices?.[0]?.message?.content || "No full response available";

            // Helper function: Extract text between two markers using regex.
            // If 'end' is null, extract to the end of the string.
            function extractBetween(start: string, end: string | null): string {
                let pattern: RegExp;
                if (end) {
                    pattern = new RegExp(start + "\\s*(.*?)\\s*(?=" + end + ")", "s");
                } else {
                    pattern = new RegExp(start + "\\s*(.*)", "s");
                }
                const match = fullResponse.match(pattern);
                return match ? match[1].trim() : "No data available";
            }

            // Assuming the aggregated response uses the following bullet point headers:
            // - Win Probability (%): ...
            // - Best Bet: ...
            // - Key Stats & Trends:
            //      - 📅 Fixture Details: ...
            //      - 📊 Recent Form: ...
            //      - 🔄 Head-to-Head Record: ...
            //      - 🚑 Injury Updates: ...
            //      - 🌍 Home/Away Impact: ...
            //      - 🔥 Tactical Insights: ...
            //      - 💰 Betting Market Movement: ...
            //      - 📈 Expert Predictions & Trends: ...
            //      - 📈 Characterization: ...

            const winProbability = extractBetween("- Win Probability (%):", "- Best Bet:");
            const bestBet = extractBetween("- Best Bet:", "- Key Stats & Trends:");
            const fixtureDetails = extractBetween("- 📅 Fixture Details:", "- 📊 Recent Form:");
            const recentForm = extractBetween("- 📊 Recent Form:", "- 🔄 Head-to-Head Record:");
            const headToHead = extractBetween("- 🔄 Head-to-Head Record:", "- 🚑 Injury Updates:");
            const injuryUpdates = extractBetween("- 🚑 Injury Updates:", "- 🌍 Home/Away Impact:");
            const homeAwayImpact = extractBetween("- 🌍 Home/Away Impact:", "- 🔥 Tactical Insights:");
            const tacticalInsights = extractBetween("- 🔥 Tactical Insights:", "- 💰 Betting Market Movement:");
            const bettingMarketMovement = extractBetween("- 💰 Betting Market Movement:", "- 📈 Expert Predictions & Trends:");
            const expertPredictions = extractBetween("- 📈 Expert Predictions & Trends:", "- 📈 Characterization:");
            const characterization = extractBetween("- 📈 Characterization:", null);

            console.log("🔄 Step 4: Mapping aggregated response into structured fields...");
            const structuredResponse: AnalysisResult = {
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
                fullText: fullResponse,
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

    return { finalResult, loading, error, analyze };
}
