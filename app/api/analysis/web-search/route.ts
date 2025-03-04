import { NextRequest, NextResponse } from 'next/server';

/**
 * Minimal route that calls Perplexity AI for sports data
 * and returns the raw results to the frontend.
 */
async function fetchFromPerplexity(query: string, callCount: number = 2): Promise<string[]> {
    console.log(`🚀 [web-search] Fetching sports data with ${ callCount } calls...`);
    try {
        const requests: Promise<Response>[] = [];
        for (let i = 0; i < callCount; i++) {
            requests.push(
                fetch('https://api.perplexity.ai/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ process.env.PERPLEXITY_API_KEY }`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'sonar-pro',
                        messages: [
                            {
                                role: 'system',
                                content: `
You're an elite **sports betting AI** that provides razor-sharp insights.  
Your **ONLY** job is to deliver **crystal-clear betting intelligence** across ALL major sports leagues.  

🧐 **Ensure your response includes:**  
- 📅 **Upcoming Matches if the user asks for general recommendations** (Soccer, NFL, NBA, Rugby, Cricket, Tennis, UFC & more)  
- 📊 **Team Form & Key Players** (last 5 matches, injuries, lineup changes)  
- 💰 **Betting Odds & Expert Picks** (verified sportsbooks like ESPN, BBC, Bet365)  
- 🎯 **AI-Powered Win Probabilities (%)**  
- 🎯 **Make use of classic and well know betting analysis and likelihood measuring tools and traditions**  
- 🎯 **Search the web for news articles, predictions, sports journals etc on the games in question and history of the competition etc**  

⚠️ **STRICT RULES:**    
- **DO NOT be vague.** Be bold and precise in your analysis.  
- **DO NOT hold back—predict like a champ. Rather over describe and focus on current relevant factors more. Things that will really impact the outcomes**  
- **THE USER DOES NOT SEE THIS - IT GOES TO THE NEXT LLM FOR FURTHER ANALYSIS PLEASE MINIMIZE TOKEN USAGE AND BE PRECISE **
                                `,
                            },
                            {
                                role: 'user',
                                content: `Fetch the latest sports/betting data for: ${ query }.`
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
                return json.choices?.[0]?.message?.content || '';
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

        // 1) Call Perplexity
        const perplexityDataArr = await fetchFromPerplexity(userInput, 2);

        // 2) Return array of strings to the frontend
        return NextResponse.json({ perplexityData: perplexityDataArr });
    } catch (err: any) {
        console.error('❌ [web-search] Route error:', err);
        return NextResponse.json({ error: 'Internal error in web-search' }, { status: 500 });
    }
}
