/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { resendVerificationCooldownMs, resendVerificationEmail } from "@/lib/services/resend-verification";

function cooldownResponse(lastSentAt: Date) {
  const retryAfter = Math.max(
    1,
    Math.ceil((resendVerificationCooldownMs - (Date.now() - lastSentAt.getTime())) / 1000),
  );
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

  const result = await resendVerificationEmail(email, request.url);
  if (result.kind === "sent") return Response.json({ success: true });
  if (result.kind === "not-found")
    return Response.json({ error: "No account was found with this email." }, { status: 404 });
  if (result.kind === "already-verified")
    return Response.json({ error: "This email is already verified." }, { status: 400 });
  if (result.kind === "cooldown") return cooldownResponse(result.lastSentAt);
  if (result.kind === "unconfigured")
    return Response.json(
      { error: "Email delivery is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local." },
      { status: 503 },
    );
  if (result.kind === "claim-failed")
    return Response.json({ error: "Verification email could not be sent. Please try again." }, { status: 409 });
  return Response.json(
    { error: "Verification email could not be sent. Check your Gmail App Password and try again." },
    { status: 502 },
  );
}
