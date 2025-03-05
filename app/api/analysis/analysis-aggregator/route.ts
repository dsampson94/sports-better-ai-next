import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import { PROMPTS } from "../../../lib/prompts";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("sportsbet_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { userInput, perplexityData, partialResponses } = await req.json();
        if (!userInput || !perplexityData || !Array.isArray(partialResponses)) {
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        let combinedText = `🔎 **User Query:** ${userInput}\n\n📊 **AI Model Responses:**\n\n`;
        for (const resp of partialResponses) {
            combinedText += `⚡ **Model:** ${resp.id}\n📌 **Response:** ${resp.text}\n\n`;
        }
        combinedText += `📡 **Live Sports Data (Perplexity):**\n${perplexityData.join("\n\n")}`;

        const finalAnswer = await callPerplexityAggregator(combinedText, perplexityData.join("\n\n"));

        // Log the final answer before returning it.
        console.log("🔥 Aggregated finalAnswer:", finalAnswer);

        return NextResponse.json({
            finalAnswer,
            partialResponses,
            updatedBalance: user.balance,
            freePredictionCount: user.freePredictionCount,
            // Assume citations are part of the Perplexity response if available.
            citations: finalAnswer.citations || [],
        });
    } catch (err: any) {
        console.error("❌ [analysis-aggregator] Error:", err);
        return NextResponse.json({ error: "Internal server error in aggregator" }, { status: 500 });
    }
}

async function callPerplexityAggregator(combinedText: string, sportsData: string): Promise<any> {
    try {
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    { role: "system", content: PROMPTS.AGGREGATOR_SYSTEM },
                    { role: "user", content: PROMPTS.AGGREGATOR_USER(combinedText, sportsData) },
                ],
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("❌ Perplexity API Error:", JSON.stringify(data, null, 2));
            return { finalAnswer: "No response from Perplexity.", citations: [] };
        }

        console.log("✅ Perplexity Aggregated Response:", JSON.stringify(data, null, 2));

        // Use finalAnswer if present; adjust if your API returns it differently.
        return {
            finalAnswer: data.finalAnswer || data.choices?.[0]?.message?.content || "",
            citations: data.citations || []
        };
    } catch (error) {
        console.error("❌ Aggregator Call Failed:", error);
        return { finalAnswer: "", citations: [] };
    }
}
