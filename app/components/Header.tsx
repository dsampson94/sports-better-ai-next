"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "../lib/auth";

interface UserProfile {
    email: string;
    username?: string;
    balance: number;
    aiCallAllowance: number;
}

interface HeaderProps {
    isAuthenticated: boolean;
    profileLoading: boolean;
    userProfile?: UserProfile;
    isDeltaAlpha?: boolean;
}

export default function Header({
                                   isAuthenticated,
                                   profileLoading,
                                   userProfile,
                                   isDeltaAlpha = false,
                               }: HeaderProps) {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    if (!isAuthenticated) {
        // Non-authenticated header
        return (
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 bg-gray-800 border-b-2 border-[#545b63] p-4 flex justify-between items-center shadow-lg z-50"
            >
                <div className="flex items-center space-x-3">
                    <Image
                        src="/logos/logo-brain.png"
                        alt="SportsBetter AI Logo"
                        width={40}
                        height={40}
                        className="object-contain"
                        priority
                    />
                    <h1 className="hidden lg:block text-xl font-bold">
                        SportsBetter AI 🏆
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-semibold transition"
                    >
                        Sign Up
                    </Link>
                </div>
            </motion.header>
        );
    }

    // Authenticated header (if needed)
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 bg-gray-800 border-b-2 border-[#545b63] p-4 flex justify-between items-center shadow-lg z-50"
        >
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-3">
                <Image
                    src="/logos/logo-brain.png"
                    alt="SportsBetter AI Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                />
                <h1 className="hidden lg:block text-xl font-bold">SportsBetter AI 🏆</h1>
            </div>
            {/* Right: User Section */}
            <div className="relative">
                {!profileLoading && (
                    <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-colors ease-in-out duration-150"
                    >
                        Get Tokens
                    </button>
                )}
                <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none transition"
                >
                    <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </button>
                {dropdownOpen && !profileLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded shadow-lg z-10"
                    >
                        <div className="px-4 py-3">
                            <p className="text-sm text-gray-400 font-semibold">
                                Hello, {userProfile?.username || userProfile?.email}
                            </p>
                            <p className="text-sm text-gray-300 mt-1">
                                <strong>Balance:</strong> ${userProfile?.balance.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-300">
                                <strong>AI Calls Remaining:</strong> {userProfile?.aiCallAllowance}
                            </p>
                        </div>
                        <div className="border-t border-gray-700">
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    router.push("/add-credit");
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 transition"
                            >
                                Add Credit
                            </button>
                            {isDeltaAlpha && (
                                <button
                                    onClick={() => router.push("/dashboard/admin")}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 transition"
                                >
                                    Admin Dashboard
                                </button>
                            )}
                            <button
                                onClick={logout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.header>
    );
}
