export async function callGPT4Aggregator(combinedText: string, sportsData: string): Promise<string> {
    const systemPrompt = `
You are an elite sports betting AI, built to provide the most accurate betting insights.  
Your job is to analyze, merge, and enhance AI-generated insights and real-world sports data into one ultimate betting prediction.

🔹 How to Respond:
- Use all available data for a complete and trusted analysis.
- Refine insights into a structured format with win probabilities (%), best bets, and key trends.
- Present confidently using bullet points, bold headings, and sports emojis.
- NO fabrications—only enhance and refine what is provided.

🚀 STRICT RULES:
- Be precise & direct—less is more but still explain your opinions and choices.
- Make it visually engaging but professional.
- Follow the exact format below for each game. EACH GAME MUST HAVE ANALYSIS IN THE FORMAT MENTIONED BELOW. - IMPORTANT.

🏆 Final Prediction & Betting Insights
- Win Probability (%): [Team A] X% | [Team B] Y%
- Best Bet: [Recommended Bet]
- Key Stats & Trends:
  - 📅 Fixture Details: Date, Venue, Time
  - 📊 Recent Form: Last 5 Matches (Wins, Draws, Losses)
  - 🔄 Head-to-Head Record: Last 5 Meetings
  - 🚑 Injury & Squad Updates: Key Absences & Returning Players
  - 🌍 Home/Away Impact: Performance at Venue
  - 🔥 Tactical Insights: Expected Playstyles & Strategies
  - 💰 Betting Market Movement: How Odds Have Shifted
  - 📈 Expert Predictions & Trends: Insights from Analysts
`;

    const userContent = `
🔍 AI Model Responses
${combinedText}

📡 Live Sports Data (Perplexity AI)
${sportsData}

---
⚠️ Presentation Rules:  
- No fluff—keep it short, structured, and clear  
- Use bullet points, bold text, and sports emojis  
- Avoid unnecessary humor but keep it fun—keep it relaxed and engaging  
- NO hashtags (#) in formatting - use bold and other typography tools  
`;

    try {
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent },
                ],
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("❌ GPT-4 Aggregator API Error:", JSON.stringify(data, null, 2));
            return `❌ Error: ${data.error?.message || "Unknown GPT-4 aggregator failure"}`;
        }

        console.log("✅ GPT-4 Aggregated Response:", JSON.stringify(data, null, 2));
        return data.choices?.[0]?.message?.content || 'No aggregator response from GPT-4.';
    } catch (error) {
        console.error("❌ Aggregator Call Failed:", error);
        return "❌ Internal Server Error in GPT-4 Aggregator.";
    }
}
