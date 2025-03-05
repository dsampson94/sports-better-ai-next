import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from '../../../authMiddleware';
import Transaction from '../../../lib/models/Transaction';

export async function GET(req: NextRequest) {
    const authResult = await authenticateAdmin(req);
    if (authResult instanceof NextResponse) return authResult; // Handle error

    const transactions = await Transaction.find().populate("user", "email username");
    return NextResponse.json(transactions, { status: 200 });
}
