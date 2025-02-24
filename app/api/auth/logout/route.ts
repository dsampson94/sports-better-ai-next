import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.redirect("/");
    response.cookies.set("sportsbet_token", "", { maxAge: 0 });
    return response;
}
