import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";

// GET /api/user/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: Record<string, string> }
) {
    try {
        await connectToDatabase();
        const { id } = params;
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("GET /api/user/[id] error:", error);
        return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
    }
}

// PATCH /api/user/[id]
export async function PATCH(
    req: NextRequest,
    { params }: { params: Record<string, string> }
) {
    try {
        await connectToDatabase();
        const { id } = params;
        const body = await req.json();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Only allow specific fields to be updated
        const allowedUpdates = ["username", "balance", "aiCallAllowance", "freePredictionCount"];
        Object.keys(body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                (user as any)[key] = body[key];
            }
        });
        await user.save();
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/user/[id] error:", error);
        return NextResponse.json({ error: "Error updating user" }, { status: 400 });
    }
}

// DELETE /api/user/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Record<string, string> }
) {
    try {
        await connectToDatabase();
        const { id } = params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/user/[id] error:", error);
        return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
    }
}
