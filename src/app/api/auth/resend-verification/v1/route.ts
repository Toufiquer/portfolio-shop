/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { createEmailVerificationToken } from "better-auth/api";
import nodemailer from "nodemailer";

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { client } from "@/app/api/lib/auth";

const resendCooldownMs = 5 * 60 * 1000;
const verificationTokenLifetimeSeconds = 60 * 60;
type UserDocument = { email?: string; emailVerified?: boolean; emailVerificationLastSentAt?: Date };

function cooldownResponse(lastSentAt: Date) {
  const retryAfter = Math.max(1, Math.ceil((resendCooldownMs - (Date.now() - lastSentAt.getTime())) / 1000));
  return Response.json(
    { error: "You can resend the verification email in a few minutes.", retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export async function POST(request: Request) {
  const limited = await rateLimitDistributed(request, "resend-verification", 5, 60_000);
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email) return Response.json({ error: "Enter your email address." }, { status: 400 });

  const users = client.db().collection<UserDocument>("user");
  const user = await users.findOne(
    { email },
    { projection: { email: 1, emailVerified: 1, emailVerificationLastSentAt: 1 } },
  );
  if (!user) return Response.json({ error: "No account was found with this email." }, { status: 404 });
  if (user.emailVerified) return Response.json({ error: "This email is already verified." }, { status: 400 });
  if (user.emailVerificationLastSentAt && Date.now() - user.emailVerificationLastSentAt.getTime() < resendCooldownMs)
    return cooldownResponse(user.emailVerificationLastSentAt);

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!gmailUser || !gmailAppPassword || !secret)
    return Response.json(
      { error: "Email delivery is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local." },
      { status: 503 },
    );

  const sentAt = new Date();
  const claimed = await users.updateOne(
    {
      email,
      $or: [
        { emailVerificationLastSentAt: { $exists: false } },
        { emailVerificationLastSentAt: { $lte: new Date(sentAt.getTime() - resendCooldownMs) } },
      ],
    },
    { $set: { emailVerificationLastSentAt: sentAt } },
  );
  if (!claimed.matchedCount) {
    const latest = await users.findOne({ email }, { projection: { emailVerificationLastSentAt: 1 } });
    if (latest?.emailVerificationLastSentAt) return cooldownResponse(latest.emailVerificationLastSentAt);
    return Response.json({ error: "Verification email could not be sent. Please try again." }, { status: 409 });
  }

  try {
    const token = await createEmailVerificationToken(secret, email, undefined, verificationTokenLifetimeSeconds);
    const baseUrl = (process.env.BETTER_AUTH_URL || new URL(request.url).origin).replace(/\/$/, "");
    const url = `${baseUrl}/api/auth/v1/verify-email?token=${token}&callbackURL=${encodeURIComponent("/login")}`;
    const htmlUrl = url.replace(/&/g, "&amp;");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
    });
    await transporter.sendMail({
      from: `<${gmailUser}>`,
      to: email,
      subject: "Verify your email address",
      text: `Verify your email address by opening this link within 1 hour:\n\n${url}\n\nIf you did not create an account, you can ignore this email.`,
      html: `
        <div style="margin:0;background:#f5f7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#172033;">
          <div style="margin:0 auto;max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,.06);">
            <div style="background:#172033;padding:28px 32px;">
              <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-.02em;">Email verification</div>
            </div>
            <div style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#172033;">Confirm your email address</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#526071;">Thanks for creating an account. Please verify your email address to continue.</p>
              <p style="margin:0 0 24px;text-align:center;"><a href="${htmlUrl}" style="display:inline-block;background:#2563eb;border-radius:8px;color:#ffffff;font-size:16px;font-weight:700;padding:13px 22px;text-decoration:none;">Verify email address</a></p>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#526071;"><strong>This link expires in 1 hour.</strong> For your security, please do not share it with anyone.</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#7a8698;">If the button does not work, copy and paste this link into your browser:</p>
              <p style="margin:8px 0 0;word-break:break-all;font-size:13px;line-height:1.5;"><a href="${htmlUrl}" style="color:#2563eb;">${htmlUrl}</a></p>
              <p style="margin:28px 0 0;border-top:1px solid #eef0f3;padding-top:20px;font-size:13px;line-height:1.5;color:#7a8698;">If you did not create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </div>`,
    });
    return Response.json({ success: true });
  } catch {
    await users.updateOne(
      { email, emailVerificationLastSentAt: sentAt },
      { $unset: { emailVerificationLastSentAt: "" } },
    );
    return Response.json(
      { error: "Verification email could not be sent. Check your Gmail App Password and try again." },
      { status: 502 },
    );
  }
}
