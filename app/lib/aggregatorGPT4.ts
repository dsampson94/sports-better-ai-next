// lib/aggregatorGPT4.ts

/**
 * Calls GPT-4 for a final aggregator that:
 * 1) references team information, past performance, stats
 * 2) produces a final best guess with no disclaimers
 * 3) provides a recommended bet or probability
 * 4) never says "I cannot predict" or "I am an AI"
 */
export async function callGPT4Aggregator(combinedText: string): Promise<string> {
    /**
     * System prompt:
     * - Instructs GPT-4 to assume it has robust data (team info, stats),
     *   even if partial or approximate.
     * - Tells it to produce a confident guess, referencing likely players
     *   and a final recommended bet.
     */
    const systemPrompt = `
You are a specialized sports-betting aggregator AI with unlimited access to team information, past performance, and player statistics. 
You must:
1) Proudly produce a guess for the next match outcome, referencing typical data: e.g. which team historically dominates, star player influences, etc.
2) Provide a short recommended bet or final pick with approximate probability. 
3) Absolutely no disclaimers that you cannot predict. 
4) Summarize stats or performance as if you had them at your disposal, even if partial. 
5) Offer a likely guess or bet, including a probability or confidence rating, e.g. 60% chance on Team X. 
Use headings, bullet points, sports emojis, and confident, data-driven reasoning. 
Never say "I cannot predict" or "As an AI." 
Be proud and thorough in referencing stats and past matches, even if they’re approximate or fabricated for the sake of providing the best guess.
`;

    /**
     * We inject combinedText (partial outputs + user query)
     * as user content. Then instruct GPT-4 to produce final analysis.
     */
    const userContent = `
Partial outputs and user query:
${ combinedText }

Please produce:
- Detailed references to teams, players, typical stats (even if approximate)
- A final best guess with a recommended bet or outcome
- Probability or confidence rating
- No disclaimers about inability. 
- Bold headings, bullet points, sports emojis
`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ process.env.OPENAI_API_KEY }`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            temperature: 1.2,
            max_tokens: 1200,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`GPT-4 aggregator error: ${ JSON.stringify(data) }`);
    }

    return data.choices?.[0]?.message?.content || 'No aggregator response from GPT-4.';
}
