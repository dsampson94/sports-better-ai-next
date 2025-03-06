'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col relative">
        {/* Scrollable Content */}
        <main className="flex-1 pt-24 pb-24 overflow-y-auto">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center px-6 sm:px-12">
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
                className="text-lg sm:text-xl text-gray-300 max-w-2xl"
            >
              Experience cutting-edge AI analysis and insights that empower you to
              make informed betting decisions.
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

          {/* Features Section */}
          <section className="py-16 bg-gray-800 mt-12">
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
                  <h4 className="text-xl font-semibold mb-2">
                    AI-Powered Predictions
                  </h4>
                  <p>
                    Harness real-time AI analysis to uncover the best betting
                    opportunities.
                  </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow"
                >
                  <h4 className="text-xl font-semibold mb-2">
                    Smart Bet Critiques
                  </h4>
                  <p>
                    Receive actionable insights and critiques to refine your
                    betting strategy.
                  </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow"
                >
                  <h4 className="text-xl font-semibold mb-2">
                    Maximize Your Winnings
                  </h4>
                  <p>
                    Leverage structured, AI-driven insights to place smarter bets
                    and boost profits.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        {/* Fixed Footer */}
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-800 text-center py-4 shadow-lg z-50"
        >
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SportsBetter AI. All rights reserved.
          </p>
        </motion.footer>
      </div>
  );
}
