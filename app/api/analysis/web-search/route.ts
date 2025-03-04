import { NextRequest, NextResponse } from 'next/server';

/**
 * Minimal route that calls Perplexity AI for sports data
 * and returns the raw results to the frontend.
 */
async function fetchFromPerplexity(query: string, callCount: number = 2): Promise<string[]> {
    console.log(`🚀 [web-search] Fetching sports data with ${callCount} calls...`);
    try {
        const requests: Promise<Response>[] = [];
        for (let i = 0; i < callCount; i++) {
            requests.push(
                fetch("https://api.perplexity.ai/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        model: "sonar-pro",
                        messages: [
                            {
                                role: "system",
                                content: `
You are a specialized sports data retrieval assistant. Your job is to retrieve
the latest sports/betting info. This content will NOT be directly shown
to the end user but will be used by subsequent AI calls.
                `
                            },
                            {
                                role: "user",
                                content: `Fetch the latest sports/betting data for: ${query}.`
                            }
                        ]
                    })
                })
            );
        }
        const responses = await Promise.all(requests);
        const dataArr = await Promise.all(
            responses.map(async (r) => {
                const json = await r.json();
                return json.choices?.[0]?.message?.content || "";
            })
        );
        console.log("✅ [web-search] Perplexity results:", JSON.stringify(dataArr, null, 2));
        return dataArr;
    } catch (err) {
        console.error("❌ [web-search] Error:", err);
        return ["Failed to retrieve data."];
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userInput } = await req.json();
        if (!userInput) {
            return NextResponse.json({ error: "No userInput provided" }, { status: 400 });
        }

        // 1) Call Perplexity
        const perplexityDataArr = await fetchFromPerplexity(userInput, 2);

        // 2) Return array of strings to the frontend
        return NextResponse.json({ perplexityData: perplexityDataArr });
    } catch (err: any) {
        console.error("❌ [web-search] Route error:", err);
        return NextResponse.json({ error: "Internal error in web-search" }, { status: 500 });
    }
}
