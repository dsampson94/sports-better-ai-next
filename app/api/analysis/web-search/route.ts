import { NextRequest, NextResponse } from 'next/server';
import { PROMPTS } from '../../../lib/prompts';

/**
 * Calls Perplexity AI for sports betting insights and returns raw results.
 */
async function fetchFromPerplexity(query: string, callCount: number = 2): Promise<string[]> {
    console.log(`🚀 [web-search] Fetching sports data with ${callCount} calls...`);

    try {
        const requests: Promise<Response>[] = Array.from({ length: callCount }, () =>
            fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [
                        { role: 'system', content: PROMPTS.WEB_SEARCH }, // Centralized prompt
                        { role: 'user', content: `Fetch the latest sports/betting data for: ${query}.` }
                    ]
                }),
            })
        );

        const responses = await Promise.all(requests);
        const dataArr = await Promise.all(
            responses.map(async (res) => {
                const json = await res.json();
                return json.choices?.[0]?.message?.content || 'No data available';
            })
        );

        console.log('✅ [web-search] Perplexity results:', JSON.stringify(dataArr, null, 2));
        return dataArr;
    } catch (err) {
        console.error('❌ [web-search] Error:', err);
        return ['Failed to retrieve data.'];
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userInput } = await req.json();
        if (!userInput) {
            return NextResponse.json({ error: 'No userInput provided' }, { status: 400 });
        }

        // Fetch data from Perplexity
        const perplexityDataArr = await fetchFromPerplexity(userInput, 2);

        return NextResponse.json({ perplexityData: perplexityDataArr });
    } catch (err: any) {
        console.error('❌ [web-search] Route error:', err);
        return NextResponse.json({ error: 'Internal error in web-search' }, { status: 500 });
    }
}
