import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const user = await User.findById(params.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('GET /api/user/[id] error:', error);
        return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const body = await req.json();

        // Find and update user by ID
        let user = await User.findById(params.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        Object.keys(body).forEach((key) => {
            // @ts-ignore
            user[key] = body[key];
        });

        await user.save();
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('PATCH /api/user/[id] error:', error);
        return NextResponse.json({ error: 'Error updating user' }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const deletedUser = await User.findByIdAndDelete(params.id);

        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('DELETE /api/user/[id] error:', error);
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }
}
