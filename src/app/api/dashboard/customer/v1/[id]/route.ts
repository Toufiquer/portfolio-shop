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
  metricsFor,
  serializeFunnel,
} from "@/lib/customers/server";
async function guard(r: Request, m: "PATCH" | "DELETE") {
  const l = rateLimit(r, "customer-api");
  if (l) return l;
  const s = await auth.api.getSession({ headers: r.headers });
  if (!s) return Response.json({ error: "Sign in required." }, { status: 401 });
  const a = await authorizeDashboardRequest(s, "/api/dashboard/customer/v1", m);
  return a.allowed ? null : Response.json({ error: a.state.message ?? "Unauthorized." }, { status: 403 });
}
export async function PATCH(r: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(r, "PATCH");
  if (g) return g;
  const id = (await params).id,
    b = await r.json().catch(() => null);
  if (b?.kind === "funnel") {
    const name = typeof b.name === "string" ? b.name.trim() : "";
    const description = typeof b.description === "string" ? b.description.trim() : "";
    const minimumAmount = Number(b.minimumAmount);
    const maximumAmount = b.maximumAmount == null || b.maximumAmount === "" ? null : Number(b.maximumAmount);
    const color = typeof b.color === "string" && /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "#d97706";
    if (
      !name ||
      name.length > 120 ||
      description.length > 500 ||
      !Number.isFinite(minimumAmount) ||
      minimumAmount < 0 ||
      (maximumAmount !== null && (!Number.isFinite(maximumAmount) || maximumAmount < minimumAmount))
    )
      return Response.json({ error: "Invalid funnel values." }, { status: 400 });
    const stages = funnelStages(b.stages);
    const position = Number.isInteger(b.position) && b.position >= 0 ? b.position : undefined;
    const x = await funnelCollection().findOneAndUpdate(
      { id },
      {
        $set: {
          name,
          description,
          minimumAmount,
          maximumAmount,
          color,
          stages,
          ...(position === undefined ? {} : { position }),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    return x
      ? Response.json({ item: serializeFunnel(x) })
      : Response.json({ error: "Funnel not found." }, { status: 404 });
  }
  const allowed = ["active", "inactive"];
  const update = { ...b, updatedAt: new Date() };
  delete update.id;
  delete update.metrics;
  if (update.customerStatus && !allowed.includes(update.customerStatus))
    return Response.json({ error: "Invalid status." }, { status: 400 });
  const x = await customerCollection().findOneAndUpdate({ id }, { $set: update }, { returnDocument: "after" });
  if (!x) return Response.json({ error: "Customer not found." }, { status: 404 });
  return Response.json({
    item: {
      ...x,
      createdAt: x.createdAt.toISOString(),
      updatedAt: x.updatedAt.toISOString(),
      metrics: await metricsFor(x),
    },
  });
}
export async function DELETE(r: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(r, "DELETE");
  if (g) return g;
  const id = (await params).id;
  if (new URL(r.url).searchParams.get("kind") === "funnel") {
    const result = await funnelCollection().deleteOne({ id });
    if (!result.deletedCount) return Response.json({ error: "Funnel not found." }, { status: 404 });
    await customerCollection().updateMany({ funnelId: id }, { $set: { funnelId: null, updatedAt: new Date() } });
    return Response.json({ deleted: true });
  }
  const x = await customerCollection().findOneAndUpdate(
    { id },
    { $set: { customerStatus: "inactive", updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return x ? Response.json({ item: x }) : Response.json({ error: "Customer not found." }, { status: 404 });
}
/*
|-----------------------------------------
| dashboard customer item API
|-----------------------------------------
*/
