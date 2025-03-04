import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";
import { callGPT4Aggregator } from "../../../lib/aggregatorGPT4";

export async function POST(req: NextRequest) {
    try {
        // Authenticate user via token in cookies
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

        // Connect to Mongo and retrieve the user
        await connectToDatabase();
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Parse request payload: expect userInput, perplexityData, partialResponses
        const { userInput, perplexityData, partialResponses } = await req.json();
        if (!userInput || !perplexityData || !Array.isArray(partialResponses)) {
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        // Merge partial responses and perplexity data for final aggregation
        let combinedText = `🔎 **User Query:** ${userInput}\n\n📊 **AI Model Responses:**\n\n`;
        for (const resp of partialResponses) {
            combinedText += `⚡ **Model:** ${resp.id}\n📌 **Response:** ${resp.text}\n\n`;
        }
        combinedText += `📡 **Live Sports Data (Perplexity):**\n${perplexityData.join("\n\n")}`;

        // Call GPT‑4 aggregator to get the final answer
        const finalAnswer = await callGPT4Aggregator(combinedText, perplexityData.join("\n\n"));

        // Return the aggregated result along with current usage info (unchanged here)
        return NextResponse.json({
            finalAnswer,
            partialResponses,
            updatedBalance: user.balance,
            freePredictionCount: user.freePredictionCount,
        });
    } catch (err: any) {
        console.error("❌ [analysis-aggregator] Error:", err);
        return NextResponse.json({ error: "Internal server error in aggregator" }, { status: 500 });
    }
}
