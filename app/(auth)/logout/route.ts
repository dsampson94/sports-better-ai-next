import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.redirect("/");
    response.cookies.set("sportsbet_token", "", { httpOnly: true, expires: new Date(0), path: "/" });
    return response;
}
