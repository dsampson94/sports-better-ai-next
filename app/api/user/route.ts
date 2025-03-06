import { NextRequest, NextResponse } from 'next/server';
import User from '../../lib/models/User';
import connectToDatabase from '../../lib/mongoose';

// Get all users
export async function GET() {
    await connectToDatabase();
    try {
        const users = await User.find({});
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
    }
}

// Create a new user
export async function POST(req: NextRequest) {
    await connectToDatabase();
    try {
        const data = await req.json();
        const user = new User(data);
        await user.save();
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating user' }, { status: 400 });
    }
}
