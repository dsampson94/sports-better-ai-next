'use client';

import { FormEvent, useState } from 'react';

export default function DashboardPage() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function handleAnalyze(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput: query }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setResult({ error: 'Error analyzing input.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">SportsBetter AI 🏆</h1>
                <nav>
                    <a href="/api/auth/logout" className="text-red-400 hover:text-red-300">
                        Logout
                    </a>
                </nav>
            </header>

            <main className="flex-1 p-4">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">AI Sports Predictions ⚽🏀🎾</h2>
                    <p className="mb-4 text-gray-400">
                        Enter your query about upcoming matches. Our AI compares multiple models
                        and provides the **best synthesized prediction**.
                    </p>

                    {/* Query Input */ }
                    <form onSubmit={ handleAnalyze } className="space-y-4">
                        <textarea
                            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                            rows={ 4 }
                            placeholder="Example: 'Who will likely win the next URC rugby match?'"
                            value={ query }
                            onChange={ (e) => setQuery(e.target.value) }
                        />
                        <button
                            type="submit"
                            disabled={ loading }
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold w-full"
                        >
                            { loading ? 'Analyzing...' : 'Get AI Prediction' }
                        </button>
                    </form>

                    {/* Display Results */ }
                    { result && (
                        <div className="mt-6 bg-gray-800 p-4 rounded space-y-4">
                            { result.error && <p className="text-red-400">Error: { result.error }</p> }

                            { !result.error && (
                                <>
                                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                        <h3 className="text-lg font-bold mb-2 text-green-400">📊 Final AI Prediction</h3>
                                        <p className="text-gray-300 whitespace-pre-wrap">{ result.finalAnswer }</p>
                                    </div>

                                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                        <h3 className="text-lg font-bold mb-2 text-blue-400">🤖 AI Model Responses</h3>
                                        <pre className="text-sm whitespace-pre-wrap text-gray-300">
                                            { JSON.stringify(result.partialResponses, null, 2) }
                                        </pre>
                                    </div>
                                </>
                            ) }
                        </div>
                    ) }
                </div>
            </main>

            <footer className="bg-gray-800 p-4 text-center text-gray-500 text-sm">
                &copy; { new Date().getFullYear() } SportsBetter AI
            </footer>
        </div>
    );
}
