import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from '../../../authMiddleware';
import User from '../../../lib/models/User';

export async function GET(req: NextRequest) {
    const authResult = await authenticateAdmin(req);
    if (authResult instanceof NextResponse) return authResult; // Handle error

    const users = await User.find().select("-password"); // Exclude sensitive data
    return NextResponse.json(users, { status: 200 });
}
