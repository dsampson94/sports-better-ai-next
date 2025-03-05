async function initialWebSearchForSportsData(query: string) {
    console.log("🚀 Fetching sports data using Perplexity AI...");

    try {
        const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
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
                        You are a **sports betting research assistant** with access to the latest **web searches** on upcoming matches. 
                        Your job is to return **only future match insights**, including:
                        - 📅 **Upcoming Fixtures & Schedules** (dates, teams, and times).
                        - 🔥 **Team Form & Performance** (last 5 matches, injuries, starting XI).
                        - 💰 **Betting Odds & Predictions** (top sportsbook picks & expected probabilities).
                        - 🏆 **Expert Predictions** (from ESPN, BBC Sports, Sportsbook, The Athletic).
                        - 🎯 **Win Probabilities** based on AI and bookmaker insights.
                        - 📊 **Statistical Analysis** (team strength, head-to-head performance, expected goals).
                        
                        ❌ **DO NOT** return past match results or summaries.  
                        ✅ **ONLY focus on upcoming matches and betting insights.**
                        `
                    },
                    {
                        role: "user",
                        content: `
                        Perform a **deep web search** and retrieve up to **100 insights** on the latest **upcoming sports fixtures, betting odds, expert predictions, and real-time win probabilities** for:
                        "${query}".
                        `
                    }
                ]
            }),
        });

        if (!perplexityRes.ok) {
            const errorText = await perplexityRes.text();
            console.error("❌ Perplexity API Error:", errorText);
            return { error: `Perplexity API Error: ${errorText}` };
        }

        const perplexityData = await perplexityRes.json();
        console.log("✅ Perplexity AI Response:", JSON.stringify(perplexityData, null, 2));

        return perplexityData;
    } catch (error) {
        console.error("❌ Fetch Live Sports Data Error:", error);
        return { error: "Server error retrieving live sports data." };
    }
}
