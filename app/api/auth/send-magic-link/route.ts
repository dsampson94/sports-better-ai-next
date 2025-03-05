import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-providers";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongoose";
import User from "../../../lib/models/User";

// Configure the v3 SES client
const ses = new SESClient({
    region: process.env.AWS_REGION,
    credentials: fromEnv(),
});

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        // If user doesn't exist, create and assign the admin role if it's deltaalphavids
        if (!user) {
            const isAdmin = email.toLowerCase() === "deltaalphavids@gmail.com";
            user = await User.create({
                email,
                role: isAdmin ? "ADMIN" : "USER",
            });
        }

        // Create a magic link token (expires in 15 min)
        const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET!, {
            expiresIn: "15m",
        });

        // Construct the magic link
        const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`;

        // Send email via SES
        const params = {
            Source: process.env.EMAIL_FROM!,
            Destination: { ToAddresses: [user.email] },
            Message: {
                Subject: { Data: "Your Magic Link to SportsBetterApp" },
                Body: {
                    Html: {
                        Data: `
              <h1>Log In to SportsBetterApp</h1>
              <p>Click below to sign in:</p>
              <a href="${magicLink}"
                 style="padding:10px 20px; background:#16a34a; color:#fff; text-decoration:none; border-radius:5px;">
                 Log In
              </a>
              <p>If you didn't request this link, ignore this email.</p>
            `,
                    },
                },
            },
        };

        await ses.send(new SendEmailCommand(params));

        return NextResponse.json({ message: "Magic link sent to your email!" });
    } catch (error) {
        console.error("Send Magic Link Error:", error);
        return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
    }
}
