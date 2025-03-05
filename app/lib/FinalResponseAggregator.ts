import { PROMPTS } from './prompts';

/**
 * Calls Perplexity AI to generate final sports betting insights.
 * @param {string} combinedText - The AI-generated analysis and partial responses.
 * @param {string} sportsData - The live sports data retrieved from Perplexity AI.
 * @returns {Promise<string>} - The final AI-enhanced sports betting analysis.
 */
export async function callPerplexityAggregator(combinedText: string, sportsData: string): Promise<string> {
    try {
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    { role: "system", content: PROMPTS.AGGREGATOR_SYSTEM },
                    { role: "user", content: PROMPTS.AGGREGATOR_USER(combinedText, sportsData) }
                ]
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("❌ Perplexity API Error:", JSON.stringify(data, null, 2));
            return `❌ Error: ${data.error?.message || "Unknown Perplexity aggregator failure"}`;
        }

        console.log("✅ Perplexity Aggregated Response:", JSON.stringify(data, null, 2));
        return data.choices?.[0]?.message?.content || "No response from Perplexity.";
    } catch (error) {
        console.error("❌ Aggregator Call Failed:", error);
        return "❌ Internal Server Error in Perplexity Aggregator.";
    }
}
