// app/api/analysis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { modelRegistry } from '../../lib/modelRegistry';
import { callGPT4Aggregator } from '../../lib/aggregatorGPT4';

/**
 * POST /api/analysis
 * Body: { userInput: string }
 */
export async function POST(req: NextRequest) {
    try {
        // 1) read user input
        const { userInput } = await req.json();
        if (!userInput) {
            return NextResponse.json({ error: "No userInput provided" }, { status: 400 });
        }

        // 2) Filter only enabled models
        const enabledModels = modelRegistry.filter((m) => m.enabled);
        if (enabledModels.length === 0) {
            return NextResponse.json({ error: "No AI models enabled" }, { status: 500 });
        }

        // 3) Call each model in parallel
        const calls = enabledModels.map((model) =>
            model
                .call(userInput)
                .then((resp) => ({ id: model.id, success: true, text: resp }))
                .catch((err) => {
                    console.error(`Error calling ${model.id}:`, err);
                    return {
                        id: model.id,
                        success: false,
                        text: `Error from ${model.id}: ${String(err)}`,
                    };
                })
        );

        const results = await Promise.all(calls);

        // 4) Check if at least one succeeded
        const successful = results.filter((r) => r.success);
        if (successful.length === 0) {
            return NextResponse.json(
                {
                    error: "All model calls failed",
                    partialResults: results,
                },
                { status: 500 }
            );
        }

        // 5) Build a combined string for GPT-4 aggregator
        let combinedText = `User input: ${userInput}\n\n` +
            "Partial model responses:\n\n";
        for (const r of results) {
            combinedText += `Model: ${r.id}\nSuccess: ${r.success}\nResponse: ${r.text}\n\n`;
        }
        combinedText += "Please compare all these responses and produce the best final answer.";

        // 6) Call GPT-4 aggregator
        const finalAnswer = await callGPT4Aggregator(combinedText);

        // 7) Return final
        return NextResponse.json({
            partialResponses: results,  // each { id, success, text }
            finalAnswer,               // aggregator result
        });
    } catch (err: any) {
        console.error("Analysis Route Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
