/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 16 August 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { getTopBanner, removeTopBanner, updateTopBanner } from "@/lib/services/topbanner";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

async function access(request: Request) {
  const limited = rateLimit(request, "dashboard-topbanner-api", 30, 60_000);
  if (limited) return { limited, session: null };
  return { limited: null, session: await auth.api.getSession({ headers: request.headers }) };
}

export async function GET(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  const banner = await getTopBanner();
  if (!session && banner?.data.isVisible === false) return Response.json({ banner: null });
  return Response.json({ banner });
}

export async function POST(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/topbanner/v1", "POST");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { variant?: unknown; data?: unknown } | null;
  if (!body || typeof body.variant !== "string" || !body.variant.trim() || !isRecord(body.data))
    return Response.json({ error: "A banner variant and JSON data object are required." }, { status: 400 });
  return Response.json({ banner: await updateTopBanner(body.variant.trim(), body.data) });
}

export async function DELETE(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/topbanner/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  await removeTopBanner();
  return Response.json({ banner: null });
}
