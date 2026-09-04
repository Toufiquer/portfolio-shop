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
type FooterRecord = { key: "site"; variant: string; data: Record<string, unknown>; updatedAt?: Date };
const collection = () => client.db().collection<FooterRecord>("footer");
const serialize = (item: FooterRecord | null) => (item ? { variant: item.variant, data: item.data } : null);
const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
async function access(request: Request) {
  const limited = rateLimit(request, "dashboard-footer-api", 30, 60_000);
  return { limited, session: limited ? null : await auth.api.getSession({ headers: request.headers }) };
}
export async function GET(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/footer/v1", "POST");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  return Response.json({ footer: serialize(await collection().findOne({ key: "site" })) });
}
export async function POST(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/footer/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { variant?: unknown; data?: unknown } | null;
  if (!body || typeof body.variant !== "string" || !body.variant.trim() || !object(body.data))
    return Response.json({ error: "A footer variant and JSON data object are required." }, { status: 400 });
  const item: FooterRecord = { key: "site", variant: body.variant.trim(), data: body.data, updatedAt: new Date() };
  await collection().updateOne({ key: "site" }, { $set: item }, { upsert: true });
  revalidatePath("/", "layout");
  return Response.json({ footer: serialize(item) });
}
export async function DELETE(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  await collection().deleteOne({ key: "site" });
  revalidatePath("/", "layout");
  return Response.json({ footer: null });
}
