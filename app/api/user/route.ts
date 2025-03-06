import connectToDatabase from 'app/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import User from '../../lib/models/User';

export async function GET() {
    try {
        await connectToDatabase();
        const users = await User.find({});
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('GET /api/user error:', error);
        return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const data = await req.json();

        // Create a new user
        const user = new User(data);
        await user.save();

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('POST /api/user error:', error);
        return NextResponse.json({ error: 'Error creating user' }, { status: 400 });
    }
}
