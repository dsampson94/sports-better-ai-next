import { PROMPTS } from "../lib/prompts";

export interface ModelDefinition {
    id: string;
    name: string;
    enabled: boolean;
    call: (userInput: string, perplexityResponses: string[]) => Promise<string>;
}

// Define the AI models with updated prompt structure
export const MIddleAnalysisModelRegistry: ModelDefinition[] = [
    {
        id: "perplexity",
        name: "Perplexity AI",
        enabled: true,
        call: async (userInput: string, perplexityResponses: string[]) => {
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
                            { role: "system", content: PROMPTS.WEB_SEARCH },
                            { role: "user", content: PROMPTS.ANALYSIS_MODEL(userInput, perplexityResponses.join("\n\n")) }
                        ]
                    })
                });

                const data = await res.json();
                return data.choices?.[0]?.message?.content || "No Perplexity response";
            } catch (error) {
                console.error("❌ Perplexity AI Call Failed:", error);
                return "❌ Perplexity AI Error.";
            }
        }
    }
];
