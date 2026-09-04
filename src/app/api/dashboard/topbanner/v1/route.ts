/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 16 August 2026
|-----------------------------------------
*/

import { revalidatePath } from "next/cache";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";

type Banner = { key: "site"; variant: string; data: Record<string, unknown>; updatedAt?: Date };
const collection = () => client.db().collection<Banner>("topbanner");
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const serialize = (item: Banner | null) => (item ? { variant: item.variant, data: item.data } : null);

async function access(request: Request) {
  const limited = rateLimit(request, "dashboard-topbanner-api", 30, 60_000);
  if (limited) return { limited, session: null };
  return { limited: null, session: await auth.api.getSession({ headers: request.headers }) };
}

export async function GET(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  const item = await collection().findOne({ key: "site" });
  const banner = serialize(item);
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
  const item: Banner = { key: "site", variant: body.variant.trim(), data: body.data, updatedAt: new Date() };
  await collection().updateOne({ key: "site" }, { $set: item }, { upsert: true });
  revalidatePath("/", "layout");
  return Response.json({ banner: serialize(item) });
}

export async function DELETE(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/topbanner/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  await collection().deleteOne({ key: "site" });
  revalidatePath("/", "layout");
  return Response.json({ banner: null });
}
