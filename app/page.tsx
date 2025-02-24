import Link from "next/link";

export default function Home() {
  return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <header className="w-full py-4 px-8 flex justify-between items-center bg-gray-800 shadow-lg">
          <h1 className="text-2xl font-bold">Sports Better</h1>
          <div className="flex gap-4">
            <Link href="/login" className="text-white border px-4 py-2 rounded-lg border-white hover:bg-white hover:text-black transition">
              Login
            </Link>
            <Link href="/register" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-semibold transition">
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-12">
          <h2 className="text-4xl sm:text-6xl font-extrabold leading-tight">Win More. Bet Smarter.</h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl">
            Sports Better uses advanced AI models to analyze upcoming matches, critique insights, and help you make the most informed betting decisions.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href="/register" className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg text-white font-semibold transition text-lg">
              Start Winning Now
            </Link>
            <Link href="/about" className="border border-white px-6 py-3 rounded-lg text-white font-semibold hover:bg-white hover:text-black transition text-lg">
              Learn More
            </Link>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-16 bg-gray-800 text-white">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl font-bold text-center">Why Choose Sports Better?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
              <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg text-center">
                <h4 className="text-xl font-semibold mb-2">AI-Powered Predictions</h4>
                <p>Get accurate betting insights using real-time AI analysis on upcoming games.</p>
              </div>
              <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg text-center">
                <h4 className="text-xl font-semibold mb-2">Smart Bet Critiques</h4>
                <p>Our AI models critique betting insights to refine predictions and reduce risk.</p>
              </div>
              <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg text-center">
                <h4 className="text-xl font-semibold mb-2">Maximize Your Winnings</h4>
                <p>Use structured AI-driven insights to place smarter bets and increase profits.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
