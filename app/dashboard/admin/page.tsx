'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    email: string;
    username?: string;
    balance: number;
    freePredictionCount: number;
    subscriptionStatus?: string;
}

interface Transaction {
    _id: string;
    user: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [usersRes, transactionsRes] = await Promise.all([
                    fetch('/api/admin/users', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                    }),
                    fetch('/api/admin/transactions', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                    }),
                ]);

                if (!usersRes.ok || !transactionsRes.ok) {
                    throw new Error('Failed to fetch data. Please check your access permissions.');
                }

                const usersData = await usersRes.json();
                const transactionsData = await transactionsRes.json();

                setUsers(usersData);
                setTransactions(transactionsData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) return <p className="text-center text-gray-300">Loading admin data...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-3">Users</h2>
                <table className="w-full border-collapse border border-gray-700">
                    <thead>
                    <tr className="bg-gray-700">
                        <th className="border border-gray-600 px-4 py-2">Email</th>
                        <th className="border border-gray-600 px-4 py-2">Username</th>
                        <th className="border border-gray-600 px-4 py-2">Balance</th>
                        <th className="border border-gray-600 px-4 py-2">Free Predictions</th>
                        <th className="border border-gray-600 px-4 py-2">Subscription</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users?.map((user) => (
                        <tr key={user._id} className="text-center">
                            <td className="border border-gray-600 px-4 py-2">{user.email}</td>
                            <td className="border border-gray-600 px-4 py-2">{user.username || 'N/A'}</td>
                            <td className="border border-gray-600 px-4 py-2">${user.balance.toFixed(2)}</td>
                            <td className="border border-gray-600 px-4 py-2">{user.freePredictionCount}</td>
                            <td className="border border-gray-600 px-4 py-2">{user.subscriptionStatus || 'Inactive'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-3">Transactions</h2>
                <table className="w-full border-collapse border border-gray-700">
                    <thead>
                    <tr className="bg-gray-700">
                        <th className="border border-gray-600 px-4 py-2">User</th>
                        <th className="border border-gray-600 px-4 py-2">Amount</th>
                        <th className="border border-gray-600 px-4 py-2">Type</th>
                        <th className="border border-gray-600 px-4 py-2">Description</th>
                        <th className="border border-gray-600 px-4 py-2">Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transactions?.map((transaction) => (
                        <tr key={transaction._id} className="text-center">
                            <td className="border border-gray-600 px-4 py-2">{transaction.user}</td>
                            <td className="border border-gray-600 px-4 py-2">${transaction.amount.toFixed(2)}</td>
                            <td className={`border border-gray-600 px-4 py-2 ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.type}
                            </td>
                            <td className="border border-gray-600 px-4 py-2">{transaction.description}</td>
                            <td className="border border-gray-600 px-4 py-2">
                                {new Date(transaction.createdAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
