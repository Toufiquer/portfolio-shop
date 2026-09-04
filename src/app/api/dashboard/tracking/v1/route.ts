/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 15 August, 2026
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";

export const trackingProviders = ["facebook", "gtm", "ga4", "tiktok"] as const;
export type TrackingProvider = (typeof trackingProviders)[number];
export type TrackingItem = {
  id: string;
  provider: TrackingProvider;
  pixelId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};
type TrackingDocument = Omit<TrackingItem, "createdAt" | "updatedAt"> & { createdAt: Date; updatedAt: Date };
const collection = () => client.db().collection<TrackingDocument>("tracking");
const serialize = (item: TrackingDocument): TrackingItem => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});
async function access(request: Request, method: "GET" | "POST") {
  const limited = rateLimit(request, "dashboard-tracking-api", 30, 60_000);
  if (limited) return { error: limited };
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };
  const allowed = await authorizeDashboardRequest(session, "/dashboard/admin/tracking", method);
  return allowed.allowed
    ? {}
    : { error: Response.json({ error: allowed.state.message ?? "Unauthorized." }, { status: 403 }) };
}
function payload(body: unknown) {
  const data = body as Partial<TrackingDocument> | null;
  const provider = data?.provider;
  const pixelId = data?.pixelId?.trim() ?? "";
  if (
    !trackingProviders.includes(provider as TrackingProvider) ||
    !pixelId ||
    pixelId.length > 150 ||
    !/^[A-Za-z0-9_\-GTM]+$/.test(pixelId)
  )
    return null;
  return { provider: provider as TrackingProvider, pixelId, enabled: Boolean(data?.enabled) };
}
export async function GET(request: Request) {
  const result = await access(request, "GET");
  if ("error" in result) return result.error;
  const items = await collection().find({}).sort({ provider: 1 }).toArray();
  return Response.json({ items: items.map(serialize) });
}
export async function POST(request: Request) {
  const result = await access(request, "POST");
  if ("error" in result) return result.error;
  const data = payload(await request.json().catch(() => null));
  if (!data) return Response.json({ error: "Enter a valid tracking ID." }, { status: 400 });
  if (await collection().findOne({ provider: data.provider }))
    return Response.json({ error: "This provider already has a tracking ID." }, { status: 409 });
  const now = new Date();
  const item: TrackingDocument = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
  await collection().insertOne(item);
  return Response.json({ item: serialize(item) }, { status: 201 });
}
