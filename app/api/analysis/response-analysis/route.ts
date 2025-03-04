import { NextRequest, NextResponse } from 'next/server';
import { modelRegistry } from '../../../lib/modelRegistry';

/**
 * Calls the enabled AI models in parallel, returning partial responses.
 * This step still doesn't finalize cost or aggregator logic, so it's less likely
 * to exceed time limits, but can still be somewhat large.
 */
export async function POST(req: NextRequest) {
    try {
        const { userInput, perplexityData } = await req.json();
        if (!userInput || !Array.isArray(perplexityData)) {
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        // 1) Filter enabled models
        const enabledModels = modelRegistry.filter((m) => m.enabled);
        if (enabledModels.length === 0) {
            return NextResponse.json({ error: "No AI models enabled" }, { status: 500 });
        }

        // 2) Call them in parallel
        const calls = enabledModels.map((model) =>
            model
                .call(userInput, perplexityData)
                .then((resp) => ({ id: model.id, success: true, text: resp }))
                .catch((err) => ({ id: model.id, success: false, text: `Error from ${model.id}: ${err}` }))
        );

        const results = await Promise.all(calls);

        // 3) Return partial results
        return NextResponse.json({ partialResponses: results });
    } catch (err: any) {
        console.error("❌ [response-analysis] Error:", err);
        return NextResponse.json({ error: "Internal error in response-analysis" }, { status: 500 });
    }
}
