import { NextRequest, NextResponse } from "next/server";

const GPT4_SEARCH_ENABLED = true;
const BING_SEARCH_ENABLED = true;
const SCRAPER_ENABLED = true;

/**
 * Fetches sports fixtures (rugby, cricket, soccer, tennis) using GPT-4 Web Search, Bing, or Web Scraping.
 */
export async function GET(req: NextRequest) {
    try {
        let fixtures = null;

        // 1️⃣ **Try GPT-4 Web Search**
        if (GPT4_SEARCH_ENABLED) {
            fixtures = await fetchWithGPT4Search();
            if (fixtures) return NextResponse.json({ source: "GPT-4 Web Search", fixtures });
        }

        // 2️⃣ **Fallback to Bing Search**
        if (BING_SEARCH_ENABLED) {
            fixtures = await fetchWithBingSearch();
            if (fixtures) return NextResponse.json({ source: "Bing Search API", fixtures });
        }

        // 3️⃣ **Fallback to Web Scraping**
        if (SCRAPER_ENABLED) {
            // fixtures = await fetchWithScraper();
            // if (fixtures) return NextResponse.json({ source: "ScraperAPI (Flashscore)", fixtures });
        }

        return NextResponse.json({ error: "Failed to retrieve sports fixtures" }, { status: 500 });
    } catch (error: any) {
        console.error("Sports Fixtures Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * 1️⃣ Fetch sports data using GPT-4 Web Search
 */
async function fetchWithGPT4Search() {
    try {
        const query = "Upcoming rugby, cricket, soccer, and tennis matches this week with dates and teams.";
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4-plugins",
                messages: [{ role: "user", content: query }],
                tools: [{ type: "web_search" }],
            }),
        });

        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error("GPT-4 Web Search Failed:", error);
        return null;
    }
}

/**
 * 2️⃣ Fetch sports data using Bing Search API
 */
async function fetchWithBingSearch() {
    try {
        const query = "Upcoming rugby, cricket, soccer, and tennis matches site:espn.com OR site:flashscore.com";
        const res = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.BING_SEARCH_API_KEY!,
            },
        });

        const data = await res.json();
        return data.webPages?.value || null;
    } catch (error) {
        console.error("Bing Search API Failed:", error);
        return null;
    }
}

/**
 * 3️⃣ Fetch sports data using ScraperAPI
 */
async function fetchWithScraper() {
    try {
        const targetURL = "https://www.flashscore.com/";
        const res = await fetch(`https://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(targetURL)}`);

        const htmlData = await res.text();
        return htmlData || null;
    } catch (error) {
        console.error("ScraperAPI Failed:", error);
        return null;
    }
}
