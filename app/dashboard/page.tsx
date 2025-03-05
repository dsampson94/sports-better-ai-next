'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { GamePrediction, useAnalysis } from '../lib/hooks/useAnalysis';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface UserProfile {
    email: string;
    username?: string;
    balance: number;
    freePredictionCount: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    // Initialize user profile with default so it doesn't flash
    const [userProfile, setUserProfile] = useState<UserProfile>({
        email: '',
        username: '',
        balance: 0,
        freePredictionCount: 0,
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { finalResult, loading, error, analyze } = useAnalysis();

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch('/api/user/me');
                if (!res.ok) throw new Error('Unauthorized');
                const data = await res.json();
                setUserProfile({
                    email: data.email || '',
                    username: data.username || '',
                    balance: data.balance ?? 0,
                    freePredictionCount: data.freePredictionCount ?? 0,
                });
            } catch (err) {
                console.error('Unauthorized access:', err);
                router.push('/login');
            } finally {
                setProfileLoading(false);
            }
        }

        fetchUserProfile();
    }, [router]);

    // Check if user is the special user "deltaalphavids"
    const isDeltaAlpha = userProfile.username === 'deltaalphavids';

    async function handleAnalyze(e: FormEvent) {
        e.preventDefault();
        setErrorMsg('');

        if (!isDeltaAlpha) {
            setErrorMsg('Under Construction, come back soon!');
            return;
        }

        const freeCalls = userProfile.freePredictionCount;
        const balance = userProfile.balance;
        const costPerCall = 0.5;

        if (freeCalls >= 3 && balance < costPerCall) {
            setErrorMsg(
                'You have used your free predictions and do not have enough balance. Please add credits.'
            );
            return;
        }
        await analyze(query);
    }

    // "Get Best Bets" button handler
    async function handleBestBets(e: FormEvent) {
        e.preventDefault();
        setErrorMsg('');

        if (!isDeltaAlpha) {
            setErrorMsg('Under Construction, come back soon!');
            return;
        }
        await analyze('Get best bets');
    }

    // Toggle user dropdown
    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    // Logout
    const handleLogout = () => {
        router.push('/api/auth/logout');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            {/* HEADER */ }
            <motion.header
                initial={ { opacity: 0, y: -20 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { duration: 0.5 } }
                className="bg-gray-800 p-2 flex justify-between items-center"
            >
                {/* Left: Logo and Title (hidden on mobile) */ }
                <div className="flex items-center space-x-3">
                    <img
                        src="/logos/logo-brain.png"
                        alt="SportsBetter AI Logo"
                        className="h-16 w-auto sm:h-[110px]"
                    />
                    <h1 className="hidden lg:block text-xl font-bold">SportsBetter AI 🏆</h1>
                </div>
                {/* Right: User Icon Dropdown */ }
                <div className="relative">
                    <button
                        onClick={ toggleDropdown }
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700
                       hover:bg-gray-600 focus:outline-none transition"
                    >
                        {/* Simple user icon (replace with an avatar if you prefer) */ }
                        <svg
                            className="w-5 h-5 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={ 2 }
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </button>
                    {/* Dropdown Panel */ }
                    { dropdownOpen && !profileLoading && (
                        <motion.div
                            initial={ { opacity: 0, y: -8 } }
                            animate={ { opacity: 1, y: 0 } }
                            exit={ { opacity: 0, y: -8 } }
                            className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded shadow-lg z-10"
                        >
                            <div className="px-4 py-3">
                                <p className="text-sm text-gray-400 font-semibold">
                                    Hello, { userProfile.username || userProfile.email }
                                </p>
                                <p className="text-sm text-gray-300 mt-1">
                                    <strong>Balance:</strong> ${ userProfile.balance.toFixed(2) }
                                </p>
                                <p className="text-sm text-gray-300">
                                    <strong>Free Calls Used:</strong> { userProfile.freePredictionCount }/3
                                </p>
                            </div>
                            <div className="border-t border-gray-700">
                                <button
                                    onClick={ () => {
                                        setDropdownOpen(false);
                                        router.push('/add-credit');
                                    } }
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 transition"
                                >
                                    Add Credit
                                </button>
                                <button
                                    onClick={ handleLogout }
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    ) }
                </div>
            </motion.header>

            {/* MAIN CONTENT */ }
            <main className="flex-1 py-4 px-4 sm:px-4">
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

                    {/* Form stacked vertically */ }
                    <form
                        onSubmit={ handleAnalyze }
                        className="flex flex-col space-y-3 w-full mb-6"
                    >
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

                        {/* Button Container (horizontal row) */ }
                        <div className="flex flex-row space-x-2">
                            <motion.button
                                whileHover={ { scale: 1.02 } }
                                whileTap={ { scale: 0.95 } }
                                type="submit"
                                disabled={ loading || !isDeltaAlpha }
                                className="bg-green-600 hover:bg-green-500 px-4 py-2
               rounded-lg text-white font-semibold text-sm
               transition-colors ease-in-out duration-150
               w-auto"
                            >
                                { isDeltaAlpha ? (loading ? 'Analyzing...' : 'Get Predictions') : 'Come back soon!' }
                            </motion.button>

                            <motion.button
                                whileHover={ { scale: 1.02 } }
                                whileTap={ { scale: 0.95 } }
                                onClick={ handleBestBets }
                                disabled={ loading || !isDeltaAlpha }
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2
               rounded-lg text-white font-semibold text-sm
               transition-colors ease-in-out duration-150
               w-auto"
                            >
                                Get Best Bets
                            </motion.button>
                        </div>

                    </form>

                    {/* Render Aggregated Intro if available */ }
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

                    {/* Render Game Prediction Blocks */ }
                    { finalResult && finalResult.predictions && finalResult.predictions.length > 0 && (
                        <div className="space-y-8">
                            { finalResult.predictions.map((prediction: GamePrediction, idx: number) => (
                                <PredictionBlock key={ idx } prediction={ prediction }/>
                            )) }

                            {/* Render Citations Once at the Bottom */ }
                            { finalResult.predictions[0].citations &&
                                finalResult.predictions[0].citations.length > 0 && (
                                    <motion.div
                                        whileHover={ { scale: 1.02 } }
                                        className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md"
                                    >
                                        <h3 className="text-lg font-bold mb-2 text-purple-400">
                                            🔗 Citations (All Games)
                                        </h3>
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

            {/* FOOTER */ }
            <footer className="bg-gray-800 p-4 text-center text-gray-500 text-sm">
                &copy; { new Date().getFullYear() } SportsBetter AI
            </footer>
        </div>
    );
}

// Component for each prediction block with collapse functionality
interface PredictionBlockProps {
    prediction: GamePrediction;
}

const PredictionBlock = ({ prediction }: PredictionBlockProps) => {
    const [collapsed, setCollapsed] = useState(false);
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
                            {/* Final Prediction */ }
                            <motion.div
                                whileHover={ { scale: 1.02 } }
                                className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md mb-4"
                            >
                                <h3 className="text-xl font-bold mb-2 text-green-400">✅ Final Prediction</h3>
                                <p className="text-gray-300">
                                    <strong>Win Probability:</strong> { prediction.winProbability }
                                </p>
                                <p className="text-gray-300">
                                    <strong>Best Bet:</strong> { prediction.bestBet }
                                </p>
                            </motion.div>
                            {/* Key Stats & Trends */ }
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                { [
                                    { title: '📅 Fixture Details', data: prediction.fixtureDetails },
                                    { title: '📊 Recent Form', data: prediction.recentForm },
                                    { title: '🔄 Head-to-Head', data: prediction.headToHead },
                                    { title: '🚑 Injury Updates', data: prediction.injuryUpdates },
                                    { title: '🌍 Home/Away Impact', data: prediction.homeAwayImpact },
                                    { title: '🔥 Tactical Insights', data: prediction.tacticalInsights },
                                    {
                                        title: '💰 Betting Market Movement',
                                        data: prediction.bettingMarketMovement,
                                    },
                                    {
                                        title: '💡 Expert Predictions & Trends',
                                        data: prediction.expertPredictions,
                                    },
                                    { title: '📝 Characterization', data: prediction.characterization },
                                    {
                                        title: '🎯 Overall Recommendation',
                                        data: prediction.overallRecommendation,
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={ i }
                                        whileHover={ { scale: 1.03 } }
                                        className="p-4 rounded-lg border border-gray-700 bg-gray-900 shadow-md"
                                    >
                                        <h4 className="text-md font-semibold text-yellow-400">
                                            { item.title }
                                        </h4>
                                        <p className="text-gray-300">{ item.data || '' }</p>
                                    </motion.div>
                                )) }
                            </div>
                            {/* Full AI Response */ }
                            <motion.div
                                whileHover={ { scale: 1.02 } }
                                className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-md mt-4"
                            >
                                <h3 className="text-lg font-bold mb-2 text-blue-400">
                                    📜 Full AI Response
                                </h3>
                                <pre className="text-sm whitespace-pre-wrap text-gray-300">
                  { prediction.fullText }
                </pre>
                            </motion.div>
                        </>
                    ) }
                </>
            ) }
        </motion.div>
    );
};
