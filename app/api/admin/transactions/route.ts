import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../lib/mongoose';
import Transaction from '../../../lib/models/Transaction';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
    await connectToDatabase();

    const token = req.cookies.get('sportsbet_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Authentication token missing' }, { status: 401 });
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);

        if (!decoded.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const transactions = await Transaction.find().populate('user', 'email username');

        return NextResponse.json(transactions, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
