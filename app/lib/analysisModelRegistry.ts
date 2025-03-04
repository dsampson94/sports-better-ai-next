export interface ModelDefinition {
    id: string;
    name: string;
    enabled: boolean;
    call: (userInput: string, perplexityResponses: string[]) => Promise<string>;
}

// Shared prompt template for all models
const sharedPromptTemplate = (userInput: string, perplexityResponses: string[]) => `
🏆 **AI Sports Analysis - Betting Insights**
---
### **🔍 User Query:**  
${ userInput }  

### **📡 Perplexity AI Responses (Live Sports Data)**
1️⃣ **First Response:**  
${ perplexityResponses[0] || 'No data available' }

2️⃣ **Second Response:**  
${ perplexityResponses[1] || 'No data available' }

---
### **🛠️ Your Task:**
- **Compare the Perplexity AI responses** and identify **inconsistencies or missing details**.
- **Validate the information** and ensure accuracy based on team form, player performance, and betting odds.
- **Analyze the betting probabilities** and **calculate the most likely outcome.**
- **Format your response with structure, bullet points, and emojis** for clarity.
- **Final Prediction:** Offer a strong **best bet recommendation** based on expert insights.

⚠️ **Important:**  
- **DO NOT fabricate stats or teams**—use only the provided data and do web searches to validate the information.
- **DO NOT hold back—predict like a champ and use multiple data sources online, like https://supersport.com/.** 
- FACT CHECK EVERYTHING AND ENSURE THE INPUT DATA IS ACCURATE AND CORRECT BY SEARCHING AND CHECKING THE WEB. 
- **THE USER DOES NOT SEE THIS - IT GOES TO THE NEXT LLM FOR FURTHER ANALYSIS PLEASE MINIMIZE TOKEN USAGE AND BE PRECISE **  
- **DO NOT say "I cannot predict"**—always provide the most **likely outcome** based on given insights.
- **Ensure clarity, bold key information, and use structured formatting.**
`;

// Define the AI models with updated prompt structure
export const AnalysisModelRegistry: ModelDefinition[] = [
    {
        id: 'perplexity',
        name: 'Perplexity AI',
        enabled: true,
        call: async (userInput: string, perplexityResponses: string[]) => {
            const prompt = sharedPromptTemplate(userInput, perplexityResponses);
            const res = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ process.env.PERPLEXITY_API_KEY }`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [
                        { role: 'system', content: prompt }
                    ]
                }),
            });
            const data = await res.json();
            return data.choices?.[0]?.message?.content || 'No Perplexity response';
        },
    },
    // {
    //     id: 'gpt4',
    //     name: 'OpenAI GPT-4',
    //     enabled: true,
    //     call: async (userInput: string, perplexityResponses: string[]) => {
    //         const prompt = sharedPromptTemplate(userInput, perplexityResponses);
    //
    //         const res = await fetch('https://api.openai.com/v1/chat/completions', {
    //             method: 'POST',
    //             headers: {
    //                 Authorization: `Bearer ${ process.env.OPENAI_API_KEY }`,
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 model: 'gpt-4',
    //                 messages: [{ role: 'user', content: prompt }],
    //             }),
    //         });
    //
    //         const data = await res.json();
    //         return data.choices?.[0]?.message?.content || 'No GPT-4 response';
    //     },
    // },
    // {
    //     id: 'gpt35',
    //     name: 'OpenAI GPT-3.5',
    //     enabled: true,
    //     call: async (userInput: string, perplexityResponses: string[]) => {
    //         const prompt = sharedPromptTemplate(userInput, perplexityResponses);
    //
    //         const res = await fetch('https://api.openai.com/v1/chat/completions', {
    //             method: 'POST',
    //             headers: {
    //                 Authorization: `Bearer ${ process.env.OPENAI_API_KEY }`,
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 model: 'gpt-3.5-turbo',
    //                 messages: [{ role: 'user', content: prompt }],
    //             }),
    //         });
    //
    //         const data = await res.json();
    //         return data.choices?.[0]?.message?.content || 'No GPT-3.5 response';
    //     },
    // },
    // {
    //     id: 'claude',
    //     name: 'Anthropic Claude',
    //     enabled: true,
    //     call: async (userInput: string, perplexityResponses: string[]) => {
    //         const prompt = sharedPromptTemplate(userInput, perplexityResponses);
    //
    //         const res = await fetch('https://api.anthropic.com/v1/complete', {
    //             method: 'POST',
    //             headers: {
    //                 'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 prompt: `\n\nHuman: ${ prompt }\n\nAssistant:`,
    //                 model: 'claude-v1.3',
    //                 max_tokens_to_sample: 500,
    //                 temperature: 0.7,
    //             }),
    //         });
    //
    //         const data = await res.json();
    //         return data.completion || 'No Claude response';
    //     },
    // },
    // {
    //     id: 'deepseek',
    //     name: 'DeepSeek',
    //     enabled: true,
    //     call: async (userInput: string, perplexityResponses: string[]) => {
    //         const prompt = sharedPromptTemplate(userInput, perplexityResponses);
    //
    //         const res = await fetch('https://api.deepseek.ai/v1/query', {
    //             method: 'POST',
    //             headers: {
    //                 Authorization: `Bearer ${ process.env.DEEPSEEK_API_KEY }`,
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ query: prompt }),
    //         });
    //
    //         const data = await res.json();
    //         return data.answer || data.result || 'No DeepSeek response';
    //     },
    // },
    // {
    //     id: 'cohere',
    //     name: 'Cohere',
    //     enabled: true,
    //     call: async (userInput: string, perplexityResponses: string[]) => {
    //         const prompt = sharedPromptTemplate(userInput, perplexityResponses);
    //
    //         const res = await fetch('https://api.cohere.ai/v1/generate', {
    //             method: 'POST',
    //             headers: {
    //                 Authorization: `Bearer ${ process.env.COHERE_API_KEY }`,
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 model: 'command-xlarge-nightly',
    //                 prompt: prompt,
    //                 max_tokens: 300,
    //                 temperature: 0.7,
    //             }),
    //         });
    //
    //         const data = await res.json();
    //         return data.generations?.[0]?.text || 'No Cohere response';
    //     },
    // },
];
