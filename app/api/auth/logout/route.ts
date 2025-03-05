import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const response = NextResponse.json({ message: "Logged out successfully" });
        response.cookies.set("sportsbet_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(0), // Expire the cookie immediately
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
}
