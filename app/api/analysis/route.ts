import { NextRequest, NextResponse } from 'next/server';
import { AnalysisModelRegistry } from '../../lib/analysisModelRegistry';
import { callGPT4Aggregator } from '../../lib/aggregatorGPT4';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../lib/mongoose';
import User from '../../lib/models/User';

/**
 * Fetches real-time sports betting data from Perplexity AI.
 * Ensures **all major competitions** are covered (Soccer, NFL, NBA, Rugby, Cricket, etc.).
 */
async function fetchReliableSportsData(query: string, callCount: number = 3): Promise<string[]> {
    console.log(`🚀 Fetching sports data with ${callCount} validation calls to Perplexity AI...`);

    try {
        const perplexityPromises: Array<Promise<Response>> = [];

        for (let i = 0; i < callCount; i++) {
            perplexityPromises.push(
                fetch("https://api.perplexity.ai/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({
                        model: "sonar-pro",
                        messages: [
                            {
                                role: "system",
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
- **DO NOT hold back—predict like a champ.**  
- **THE USER DOES NOT SEE THIS - IT GOES TO THE NEXT LLM FOR FURTHER ANALYSIS PLEASE MINIMIZE TOKEN USAGE AND BE PRECISE **
                                `,
                            },
                            {
                                role: "user",
                                content: `Retrieve the latest **sports betting data** for: **${query}**.`,
                            },
                        ],
                    }),
                })
            );
        }

        const responses = await Promise.all(perplexityPromises);

        const jsonResponses = await Promise.all(
            responses.map(async (res) => {
                const data = await res.json();
                return data.choices?.[0]?.message?.content || "";
            })
        );

        console.log("✅ **Perplexity AI Data Retrieved:**", JSON.stringify(jsonResponses, null, 2));
        return jsonResponses;
    } catch (error) {
        console.error("❌ **Perplexity API Error:**", error);
        return ["Failed to retrieve sports data."];
    }
}

/**
 * ✅ **AI-Powered Sports Betting API**
 * - Fetches live sports betting data from **Perplexity AI**
 * - Calls multiple **AI models** to analyze the data
 * - Aggregates the best response with **maximum betting confidence**
 */
export async function POST(req: NextRequest) {
    try {
        // ===== Begin Added Costing Logic =====
        // Authenticate user and connect to database
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Costing: first 3 predictions are free; after that, each prediction costs $0.50.
        const freeCount = user.freePredictionCount || 0;
        const cost = freeCount < 3 ? 0 : 0.50;
        if (cost > 0 && (user.balance || 0) < cost) {
            return NextResponse.json({ error: "Insufficient balance. Please add more dollars." }, { status: 400 });
        }
        // ===== End Added Costing Logic =====

        const { userInput } = await req.json();
        if (!userInput) {
            return NextResponse.json({ error: "No userInput provided" }, { status: 400 });
        }

        // 🔥 **Fetch live sports betting data**
        const liveSportsDataArr = await fetchReliableSportsData(userInput, 2);
        const liveSportsData = liveSportsDataArr.join("\n\n");

        // 🚀 **Call enabled AI models to analyze Perplexity AI data**
        const enabledModels = AnalysisModelRegistry.filter((m) => m.enabled);
        if (enabledModels.length === 0) {
            return NextResponse.json({ error: "No AI models enabled" }, { status: 500 });
        }

        const calls = enabledModels.map((model) =>
            model
                .call(userInput, liveSportsDataArr)
                .then((resp) => ({ id: model.id, success: true, text: resp }))
                .catch((err) => ({ id: model.id, success: false, text: `Error from ${model.id}: ${err}` }))
        );

        const results = await Promise.all(calls);

        // Ensure at least one successful AI response
        const successful = results.filter((r) => r.success);
        if (successful.length === 0) {
            return NextResponse.json({ error: "All AI models failed", partialResponses: results }, { status: 500 });
        }

        // 🔥 **Merge AI responses + Perplexity data for final GPT-4 aggregation**
        let combinedText = `🔎 **User Query:** ${userInput}\n\n📊 **AI Model Responses:**\n\n`;
        for (const r of results) {
            combinedText += `⚡ **Model:** ${r.id}\n📌 **Response:** ${r.text}\n\n`;
        }
        combinedText += `📡 **Live Sports Data (Perplexity AI):**\n${liveSportsData}`;

        // 🚀 **Call GPT-4 Aggregator to generate the final best response**
        const finalAnswer = await callGPT4Aggregator(combinedText, liveSportsData);

        // Update user: increment free prediction count if free predictions remain, otherwise deduct cost.
        if (freeCount < 3) {
            user.freePredictionCount = freeCount + 1;
        } else {
            user.balance = (user.balance || 0) - cost;
        }
        await user.save();

        return NextResponse.json({ partialResponses: results, finalAnswer, updatedBalance: user.balance, freePredictionCount: user.freePredictionCount });
    } catch (err: any) {
        console.error("❌ **Analysis Route Error:**", err);
        return NextResponse.json({ error: "Internal server error in analysis route" }, { status: 500 });
    }
}
