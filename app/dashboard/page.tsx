'use client';

import React, { FormEvent, useState } from 'react';
import { GamePrediction, useAnalysis } from '../lib/hooks/useAnalysis';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useAuth from '../lib/hooks/useAuth';

export default function DashboardPage() {
    const router = useRouter();
    const { userProfile, isAuthenticated, profileLoading } = useAuth();
    const [query, setQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { finalResult, loading, error, analyze } = useAnalysis();

    // Redirect unauthenticated users
    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    // Check if user is the special user "deltaalphavids"
    const isDeltaAlpha = userProfile?.username === 'deltaalphavids';
    const isButtonDisabled =
        (userProfile?.freePredictionCount ?? 0) <= 0 &&
        (userProfile?.aiCallAllowance ?? 0) <= 0;

    async function handleAnalyze(e: FormEvent) {
        e.preventDefault();
        setErrorMsg('');

        if (!userProfile?._id) {
            setErrorMsg('Error: User ID not found.');
            return;
        }

        let updatedUserData = { ...userProfile };

        if (userProfile.freePredictionCount > 0) {
            updatedUserData.freePredictionCount -= 1;
        } else if (userProfile.aiCallAllowance > 0) {
            updatedUserData.aiCallAllowance -= 1;
        } else {
            setErrorMsg('You have used all AI calls. Please purchase more tokens.');
            return;
        }

        try {
            // Update user data in DB
            const response = await fetch(`/api/user/${ userProfile._id }`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    freePredictionCount: updatedUserData.freePredictionCount,
                    aiCallAllowance: updatedUserData.aiCallAllowance,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user profile');
            }

            await analyze(query);
        } catch (error) {
            console.error('Error updating user profile:', error);
            setErrorMsg('Something went wrong. Please try again.');
        }
    }

    async function handleBestBets(e: FormEvent) {
        e.preventDefault();
        setErrorMsg('');

        if (!isDeltaAlpha) {
            setErrorMsg('Under Construction, come back soon!');
            return;
        }
        await analyze('Get best bets');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex pt-24 flex-col font-sans">
            <main className="flex-1 px-4">
                <motion.div
                    initial={ { opacity: 0, y: 20 } }
                    animate={ { opacity: 1, y: 0 } }
                    transition={ { duration: 0.5, delay: 0.3 } }
                    className="w-full max-w-screen-xl mx-auto"
                >
                    { errorMsg && (
                        <motion.div
                            initial={ { scale: 0.9, opacity: 0 } }
                            animate={ { scale: 1, opacity: 1 } }
                            className="bg-red-700 p-3 rounded mb-4 text-red-100 text-center"
                        >
                            { errorMsg }
                        </motion.div>
                    ) }

                    {/* Form */ }
                    <form onSubmit={ handleAnalyze } className="flex flex-col space-y-3 w-full mb-6">
                        <motion.textarea
                            initial={ { opacity: 0, y: 10 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { duration: 0.3 } }
                            className="p-4 rounded-lg bg-gray-800 border border-gray-600
                             focus:outline-none focus:ring-2 focus:ring-green-500
                             focus:border-transparent text-sm transition-colors
                             ease-in-out duration-150 w-full"
                            rows={ 1 }
                            placeholder='e.g. "Who will likely win the next big rugby match?"'
                            value={ query }
                            onChange={ (e) => setQuery(e.target.value) }
                        />

                        {/* Buttons */ }
                        <div className="flex flex-row space-x-2">
                            <motion.button
                                type="submit"
                                disabled={ isButtonDisabled }
                                className={ `
                                    px-4 py-2 rounded-lg font-semibold text-sm transition 
                                    ${ isButtonDisabled ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-green-600 hover:bg-green-500 text-white' }
                                ` }
                            >
                                { isButtonDisabled ? 'Get More Tokens' : (loading ? 'Analyzing...' : 'Get Predictions') }
                            </motion.button>

                            <motion.button
                                whileHover={ { scale: 1.02 } }
                                whileTap={ { scale: 0.95 } }
                                onClick={ handleBestBets }
                                disabled={ loading }
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2
                                rounded-lg text-white font-semibold text-sm
                                transition-colors ease-in-out duration-150 w-auto"
                            >
                                Get Best Bets
                            </motion.button>
                        </div>
                    </form>

                    {/* Results */ }
                    { finalResult && finalResult.aggregatedIntro && (
                        <motion.div
                            initial={ { opacity: 0, y: 10 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { duration: 0.5 } }
                            className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md mb-8"
                        >
                            <h3 className="text-xl font-bold text-blue-300 mb-2">Overview</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{ finalResult.aggregatedIntro }</p>
                        </motion.div>
                    ) }

                    {/* Predictions */ }
                    { finalResult && finalResult.predictions && finalResult.predictions.length > 0 && (
                        <div className="space-y-8">
                            { finalResult.predictions.map((prediction: GamePrediction, idx: number) => (
                                <PredictionBlock key={ idx } prediction={ prediction }/>
                            )) }

                            { finalResult.predictions[0].citations && finalResult.predictions[0].citations.length > 0 && (
                                <motion.div whileHover={ { scale: 1.02 } }
                                            className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md">
                                    <h3 className="text-lg font-bold mb-2 text-purple-400">🔗 Citations (All Games)</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                        { finalResult.predictions[0].citations.map((cite, cIdx) => (
                                            <li key={ cIdx }>{ cite }</li>
                                        )) }
                                    </ul>
                                </motion.div>
                            ) }
                        </div>
                    ) }

                    { error && (
                        <motion.div className="mt-4 text-red-400 text-center">{ error }</motion.div>
                    ) }
                </motion.div>
            </main>
        </div>
    );
}

// Component for each prediction block with collapse functionality
interface PredictionBlockProps {
    prediction: GamePrediction;
}

const PredictionBlock = ({ prediction }: PredictionBlockProps) => {
    const [collapsed, setCollapsed] = useState(true);
    const isIntroBlock = prediction.gameTitle.startsWith('🔮');

    return (
        <motion.div
            initial={ { opacity: 0, scale: 0.95 } }
            animate={ { opacity: 1, scale: 1 } }
            transition={ { duration: 0.5 } }
            className="bg-gray-800 p-6 rounded shadow-lg w-full"
        >
            <h2 className="text-2xl font-bold text-blue-300 mb-1">{ prediction.gameTitle }</h2>
            { prediction.competition && (
                <p className="text-sm text-gray-400 mb-3">Competition: { prediction.competition }</p>
            ) }
            { isIntroBlock ? (
                <p className="text-gray-300 whitespace-pre-wrap">{ prediction.fullText }</p>
            ) : (
                <>
                    <button
                        className="mb-4 bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600 transition"
                        onClick={ () => setCollapsed(!collapsed) }
                    >
                        { collapsed ? 'Show Details' : 'Hide Details' }
                    </button>
                    { !collapsed && (
                        <>
                            <motion.div whileHover={ { scale: 1.02 } }
                                        className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md mb-4">
                                <h3 className="text-xl font-bold mb-2 text-green-400">✅ Final Prediction</h3>
                                <p className="text-gray-300">
                                    <strong>Win Probability:</strong> { prediction.winProbability }
                                </p>
                                <p className="text-gray-300">
                                    <strong>Best Bet:</strong> { prediction.bestBet }
                                </p>
                            </motion.div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                { [
                                    { title: '📅 Fixture Details', data: prediction.fixtureDetails },
                                    { title: '📊 Recent Form', data: prediction.recentForm },
                                    { title: '🔄 Head-to-Head', data: prediction.headToHead },
                                    { title: '🚑 Injury Updates', data: prediction.injuryUpdates },
                                    { title: '🌍 Home/Away Impact', data: prediction.homeAwayImpact },
                                    { title: '🔥 Tactical Insights', data: prediction.tacticalInsights },
                                    { title: '💰 Betting Market Movement', data: prediction.bettingMarketMovement },
                                    { title: '💡 Expert Predictions & Trends', data: prediction.expertPredictions },
                                    { title: '📝 Characterization', data: prediction.characterization },
                                    { title: '🎯 Overall Recommendation', data: prediction.overallRecommendation },
                                ].map((item, i) => (
                                    <motion.div key={ i } whileHover={ { scale: 1.03 } }
                                                className="p-4 rounded-lg border border-gray-700 bg-gray-900 shadow-md">
                                        <h4 className="text-md font-semibold text-yellow-400">{ item.title }</h4>
                                        <p className="text-gray-300">{ item.data || '' }</p>
                                    </motion.div>
                                )) }
                            </div>
                            <motion.div whileHover={ { scale: 1.02 } }
                                        className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md mt-4">
                                <h3 className="text-lg font-bold mb-2 text-blue-400">📜 Full AI Response</h3>
                                <pre className="text-sm whitespace-pre-wrap text-gray-300">{ prediction.fullText }</pre>
                            </motion.div>
                        </>
                    ) }
                </>
            ) }
        </motion.div>
    );
};
