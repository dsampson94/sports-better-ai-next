import { useState } from "react";

export function useAnalysis() {
    const [finalResult, setFinalResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    async function analyze(userInput: string) {
        setLoading(true);
        setFinalResult(null);
        setError("");

        try {
            // Step 1: Call web-search endpoint (Perplexity)
            const webSearchRes = await fetch("/api/analysis/web-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput }),
            });
            const webSearchData = await webSearchRes.json();
            if (webSearchData.error) throw new Error(webSearchData.error);
            const perplexityData = webSearchData.perplexityData;

            // Step 2: Call response-analysis endpoint (multiple AI models)
            const responseAnalysisRes = await fetch("/api/analysis/response-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData }),
            });
            const responseAnalysisData = await responseAnalysisRes.json();
            if (responseAnalysisData.error) throw new Error(responseAnalysisData.error);
            const partialResponses = responseAnalysisData.partialResponses;

            // Step 3: Call analysis-aggregator endpoint (final aggregation)
            const aggregatorRes = await fetch("/api/analysis/analysis-aggregator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput, perplexityData, partialResponses }),
            });
            const aggregatorData = await aggregatorRes.json();
            if (aggregatorData.error) throw new Error(aggregatorData.error);

            // Step 4: Update the user's usage (free call count or deduct $0.50) in the DB
            const updateRes = await fetch("/api/user/update-usage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const updateData = await updateRes.json();
            if (updateData.error) {
                // Log a warning and proceed (or handle this case as needed)
                console.warn("Warning: Failed to update usage:", updateData.error);
            }
            // Merge updated usage info into the aggregator data
            if (updateData.updatedBalance !== undefined) {
                aggregatorData.updatedBalance = updateData.updatedBalance;
            }
            if (updateData.freePredictionCount !== undefined) {
                aggregatorData.freePredictionCount = updateData.freePredictionCount;
            }

            setFinalResult(aggregatorData);
        } catch (e: any) {
            setError(e.message || "Error analyzing input.");
        } finally {
            setLoading(false);
        }
    }

    return { finalResult, loading, setLoading, error, analyze };
}
