// lib/modelRegistry.ts

// Each model has an ID, a call function, and an enabled flag.
export interface ModelDefinition {
    id: string;
    name: string;
    enabled: boolean;
    call: (prompt: string) => Promise<string>;
}

// Build an array or dictionary of models.
export const modelRegistry: ModelDefinition[] = [
    {
        id: "gpt4",
        name: "OpenAI GPT-4",
        enabled: true,
        call: async (prompt: string) => {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [{ role: "user", content: prompt }],
                }),
            });
            const data = await res.json();
            return data.choices?.[0]?.message?.content || "No GPT-4 response";
        },
    },
    {
        id: "gpt35",
        name: "OpenAI GPT-3.5",
        enabled: true,
        call: async (prompt: string) => {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                }),
            });
            const data = await res.json();
            return data.choices?.[0]?.message?.content || "No GPT-3.5 response";
        },
    },
    {
        id: "claude",
        name: "Anthropic Claude",
        enabled: true,
        call: async (prompt: string) => {
            const res = await fetch("https://api.anthropic.com/v1/complete", {
                method: "POST",
                headers: {
                    "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
                    model: "claude-v1.3",
                    max_tokens_to_sample: 500,
                    temperature: 0.7,
                }),
            });
            const data = await res.json();
            return data.completion || "No Claude response";
        },
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        enabled: true,
        call: async (prompt: string) => {
            const res = await fetch("https://api.deepseek.ai/v1/query", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: prompt }),
            });
            const data = await res.json();
            return data.answer || data.result || "No DeepSeek response";
        },
    },
    {
        id: "cohere",
        name: "Cohere",
        enabled: true,
        call: async (prompt: string) => {
            const res = await fetch("https://api.cohere.ai/v1/generate", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "command-xlarge-nightly",
                    prompt,
                    max_tokens: 300,
                    temperature: 0.7,
                }),
            });
            const data = await res.json();
            return data.generations?.[0]?.text || "No Cohere response";
        },
    },
];
