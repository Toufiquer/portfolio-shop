/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 7 September, 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import {
  customerCollection,
  funnelCollection,
  funnelStages,
  id,
  metricsFor,
  normalize,
  now,
  type CustomerRecord,
  type Funnel,
  serializeFunnel,
} from "@/lib/customers/server";
import { customerStatuses } from "@/lib/dashboard/customers";
const guard = async (r: Request, method: "GET" | "POST") => {
  const limited = rateLimit(r, "customer-api");
  if (limited) return limited;
  const s = await auth.api.getSession({ headers: r.headers });
  if (!s) return Response.json({ error: "Sign in required." }, { status: 401 });
  const a = await authorizeDashboardRequest(s, "/api/dashboard/customer/v1", method);
  return a.allowed ? null : Response.json({ error: a.state.message ?? "Unauthorized." }, { status: 403 });
};
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim().length <= max ? v.trim() : "");
export async function GET(r: Request) {
  const g = await guard(r, "GET");
  if (g) return g;
  const q = new URL(r.url).searchParams;
  const kind = q.get("kind") ?? "customers";
  if (kind === "funnels") {
    const items = await funnelCollection().find({}).sort({ name: 1 }).toArray();
    return Response.json({
      items: items.map(serializeFunnel),
    });
  }
  const search = normalize(q.get("search"));
  const status = q.get("status");
  const filter: Record<string, unknown> = {
    ...(status && customerStatuses.includes(status as never) ? { customerStatus: status } : {}),
    ...(search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { mobileNumber: { $regex: search, $options: "i" } },
            { whatsappNumber: { $regex: search, $options: "i" } },
          ],
        }
      : {}),
  };
  const items = await customerCollection().find(filter).sort({ updatedAt: -1 }).limit(100).toArray();
  return Response.json({
    items: await Promise.all(
      items.map(async (x) => ({
        ...x,
        createdAt: x.createdAt.toISOString(),
        updatedAt: x.updatedAt.toISOString(),
        metrics: await metricsFor(x),
      })),
    ),
  });
}
export async function POST(r: Request) {
  const g = await guard(r, "POST");
  if (g) return g;
  const b = (await r.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = b?.kind ?? "customer";
  if (kind === "funnel") {
    const name = text(b?.name, 120);
    const min = Number(b?.minimumAmount);
    const max = b?.maximumAmount == null || b.maximumAmount === "" ? null : Number(b.maximumAmount);
    if (!name || !Number.isFinite(min) || min < 0 || (max !== null && (!Number.isFinite(max) || max < min)))
      return Response.json({ error: "Invalid funnel values." }, { status: 400 });
    const x: Funnel = {
      id: id(),
      name,
      description: text(b?.description, 500),
      minimumAmount: min,
      maximumAmount: max,
      stages: funnelStages(b?.stages),
      createdAt: now(),
      updatedAt: now(),
    };
    await funnelCollection().insertOne(x);
    return Response.json({ item: serializeFunnel(x) }, { status: 201 });
  }
  const email = normalize(b?.email);
  const mobile = text(b?.mobileNumber, 40);
  const wa = text(b?.whatsappNumber, 40);
  const name = text(b?.name, 120);
  if (!name || !email) return Response.json({ error: "Name and email are required." }, { status: 400 });
  const duplicate = await customerCollection().findOne({
    $or: [{ email }, ...(mobile ? [{ mobileNumber: mobile }] : []), ...(wa ? [{ whatsappNumber: wa }] : [])],
  });
  if (duplicate)
    return Response.json({ error: "A customer with the same email or phone already exists." }, { status: 409 });
  const x: CustomerRecord = {
    id: id(),
    funnelId: text(b?.funnelId, 80) || null,
    name,
    email,
    address: text(b?.address, 500),
    whatsappNumber: wa,
    mobileNumber: mobile,
    source: text(b?.source, 120),
    author: text(b?.author, 120),
    notes: text(b?.notes, 2000),
    customerStatus: customerStatuses.includes(b?.customerStatus as never) ? (b?.customerStatus as never) : "lead",
    tags: Array.isArray(b?.tags) ? b.tags.filter((v): v is string => typeof v === "string").slice(0, 30) : [],
    createdAt: now(),
    updatedAt: now(),
  };
  await customerCollection().insertOne(x);
  return Response.json(
    {
      item: {
        ...x,
        createdAt: x.createdAt.toISOString(),
        updatedAt: x.updatedAt.toISOString(),
        metrics: await metricsFor(x),
      },
    },
    { status: 201 },
  );
}
/*
|-----------------------------------------
| dashboard customer and funnel API
|-----------------------------------------
*/
