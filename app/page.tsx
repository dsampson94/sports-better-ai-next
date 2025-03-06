"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col relative">
        {/* Scrollable Content */}
        <main className="flex-1 pt-24 overflow-y-auto">
          {/* Hero Section */}
          <section className="flex flex-col py-36 items-center justify-center text-center px-6 sm:px-12">
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl sm:text-6xl font-extrabold leading-tight mb-4"
            >
              Win More. Bet Smarter.
            </motion.h2>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg sm:text-xl text-gray-300 max-w-3xl"
            >
              Take your sports betting to the next level with real-time AI predictions,
              in-depth critiques, and data-driven insights. Our advanced algorithms
              analyze thousands of data points—helping you outsmart the odds and make
              winning decisions more often.
            </motion.p>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link
                  href="/register"
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg text-white font-semibold transition text-lg"
              >
                Start Winning Now
              </Link>
              <Link
                  href="/about"
                  className="border border-white px-6 py-3 rounded-lg text-white font-semibold hover:bg-white hover:text-black transition text-lg"
              >
                Learn More
              </Link>
            </motion.div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 bg-gray-800 mt-12">
            <div className="container mx-auto px-6">
              <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-bold text-center mb-8"
              >
                How It Works
              </motion.h3>
              <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-8 text-center"
              >
                <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <h4 className="text-xl font-semibold mb-2">1. Sign Up</h4>
                  <p className="text-gray-300">
                    Create a free account in seconds to start exploring our AI-driven
                    predictions and insights.
                  </p>
                </div>
                <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <h4 className="text-xl font-semibold mb-2">2. Fund or Get Tokens</h4>
                  <p className="text-gray-300">
                    Add credit or purchase tokens to unlock in-depth analysis and premium
                    betting tools tailored to your style.
                  </p>
                </div>
                <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <h4 className="text-xl font-semibold mb-2">3. Analyze & Refine</h4>
                  <p className="text-gray-300">
                    Access real-time AI predictions, critique your bets, and refine your
                    strategy with personalized recommendations.
                  </p>
                </div>
                <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <h4 className="text-xl font-semibold mb-2">4. Place Smarter Bets</h4>
                  <p className="text-gray-300">
                    Confidently wager on your favorite sports with a clear edge—track your
                    results and watch your winnings grow.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-gray-900">
            <div className="container mx-auto px-6">
              <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-bold text-center mb-8"
              >
                Why Choose SportsBetter AI?
              </motion.h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow"
                >
                  <h4 className="text-xl font-semibold mb-2">AI-Powered Predictions</h4>
                  <p className="text-gray-300">
                    Our models scan live stats and historical data, highlighting the most
                    profitable betting opportunities in real time.
                  </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow"
                >
                  <h4 className="text-xl font-semibold mb-2">Smart Bet Critiques</h4>
                  <p className="text-gray-300">
                    Receive actionable feedback on your bets—our AI refines predictions
                    and reduces risk by pointing out key factors you might have missed.
                  </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow"
                >
                  <h4 className="text-xl font-semibold mb-2">Maximize Your Winnings</h4>
                  <p className="text-gray-300">
                    Leverage structured, AI-driven insights to place smarter bets, cut
                    losses, and see your profits climb.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 bg-gray-800">
            <div className="container mx-auto px-6">
              <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-bold text-center mb-8"
              >
                Success Stories
              </motion.h3>
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <p className="text-gray-300 mb-4 italic">
                    “I’ve tried countless betting tools, but nothing compares to
                    SportsBetter AI. In just a few weeks, my winning rate soared by over
                    30%. The AI critiques are game-changing!”
                  </p>
                  <h4 className="font-semibold text-green-400">— Alex M.</h4>
                </div>
                <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <p className="text-gray-300 mb-4 italic">
                    “As someone new to sports betting, the step-by-step analysis and real
                    insights helped me learn fast and win more. Highly recommend
                    SportsBetter AI for anyone looking to up their game.”
                  </p>
                  <h4 className="font-semibold text-green-400">— Jamie L.</h4>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
      </div>
  );
}
