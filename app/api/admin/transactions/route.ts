import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import Transaction from '../../../lib/models/Transaction';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const transactions = await Transaction.find().populate('user', 'email');
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
