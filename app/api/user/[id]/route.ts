import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../lib/models/User';

// GET /api/user/[id]
export async function GET(req: NextRequest, { params }) {
    try {
        await connectToDatabase();
        const { id } = params as { id: string };
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('GET /api/user/[id] error:', error);
        return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
    }
}

// PATCH /api/user/[id]
export async function PATCH(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { email, freePredictionCount, aiCallAllowance } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update only allowed fields
        user.freePredictionCount = freePredictionCount ?? user.freePredictionCount;
        user.aiCallAllowance = aiCallAllowance ?? user.aiCallAllowance;

        await user.save();

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/user error:", error);
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}

// DELETE /api/user/[id]
export async function DELETE(req: NextRequest, { params }) {
    try {
        await connectToDatabase();
        const { id } = params as { id: string };
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('DELETE /api/user/[id] error:', error);
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }
}
