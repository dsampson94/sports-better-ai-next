import { NextRequest, NextResponse } from 'next/server';
import { PROMPTS } from '../../../lib/prompts';

export async function POST(req: NextRequest) {
    console.log("🚀 [response-analysis] Request received.");

    try {
        const { userInput, perplexityData } = await req.json();
        console.log("🔍 [response-analysis] Payload parsed. User input:", userInput);
        console.log("🔍 [response-analysis] Received perplexityData count:", Array.isArray(perplexityData) ? perplexityData.length : "Invalid");

        if (!userInput || !Array.isArray(perplexityData)) {
            console.error("❌ [response-analysis] Invalid payload:", { userInput, perplexityData });
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        // 1) Filter enabled models
        const enabledModels = MiddleAnalysisModelRegistry.filter((m) => m.enabled);
        console.log("🔍 [response-analysis] Enabled models count:", enabledModels.length);
        if (enabledModels.length === 0) {
            console.error("❌ [response-analysis] No AI models are enabled.");
            return NextResponse.json({ error: "No AI models enabled" }, { status: 500 });
        }

        // 2) Call them in parallel
        console.log("🚀 [response-analysis] Initiating parallel calls to AI models...");
        const calls = enabledModels.map((model) => {
            console.log(`🔄 [response-analysis] Calling model: ${model.id}`);
            return model
                .call(userInput, perplexityData)
                .then((resp) => {
                    console.log(`✅ [response-analysis] Model ${model.id} succeeded.`);
                    return { id: model.id, success: true, text: resp };
                })
                .catch((err) => {
                    console.error(`❌ [response-analysis] Model ${model.id} failed with error:`, err);
                    return { id: model.id, success: false, text: `Error from ${model.id}: ${err}` };
                });
        });

        const results = await Promise.all(calls);
        console.log("✅ [response-analysis] All model calls completed. Results:", results);

        // 3) Return partial results
        console.log("🚀 [response-analysis] Sending partial responses.");
        return NextResponse.json({ partialResponses: results });
    } catch (err: any) {
        console.error("❌ [response-analysis] Internal error:", err);
        return NextResponse.json({ error: "Internal error in response-analysis" }, { status: 500 });
    }
}

export interface ModelDefinition {
    id: string;
    name: string;
    enabled: boolean;
    call: (userInput: string, perplexityResponses: string[]) => Promise<string>;
}

const MiddleAnalysisModelRegistry: ModelDefinition[] = [
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
