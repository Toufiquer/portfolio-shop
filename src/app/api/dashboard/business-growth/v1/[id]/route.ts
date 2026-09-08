/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 7 September, 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";
import {
  customerCollection,
  councilorCollection,
  customerFollowUps,
  funnelCollection,
  funnelStages,
  metricsFor,
  serializeFunnel,
  serializeFollowUps,
  spendCollection,
} from "@/lib/customers/server";
async function guard(r: Request, m: "PATCH" | "DELETE") {
  const l = rateLimit(r, "customer-api");
  if (l) return l;
  const s = await auth.api.getSession({ headers: r.headers });
  if (!s) return Response.json({ error: "Sign in required." }, { status: 401 });
  const a = await authorizeDashboardRequest(s, "/api/dashboard/business-growth/v1", m);
  return a.allowed ? null : Response.json({ error: a.state.message ?? "Unauthorized." }, { status: 403 });
}
const followUpAuthor = (session: { user?: { email?: unknown; name?: unknown } } | null) => ({
  authorEmail: typeof session?.user?.email === "string" ? session.user.email.trim().toLowerCase() : "",
  authorName: typeof session?.user?.name === "string" ? session.user.name.trim() : "",
});
async function canManageCustomer(session: Awaited<ReturnType<typeof auth.api.getSession>>, id: string) {
  if (!session) return false;
  const access = await getDashboardAccessState(session);
  if (access.bypassed || /^(admin|super admin)$/i.test(access.roleName?.trim() ?? "")) return true;
  return Boolean(
    await customerCollection().findOne(
      { id, councilorEmail: session.user.email?.trim().toLowerCase() },
      { projection: { id: 1 } },
    ),
  );
}
export async function PATCH(r: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(r, "PATCH");
  if (g) return g;
  const session = await auth.api.getSession({ headers: r.headers });
  const id = (await params).id,
    b = await r.json().catch(() => null);
  if (b?.kind === "councilor") {
    const access = session ? await getDashboardAccessState(session) : null;
    if (!access || (!access.bypassed && !/^(admin|super admin)$/i.test(access.roleName?.trim() ?? "")))
      return Response.json({ error: "Administrator access required." }, { status: 403 });
    const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return Response.json({ error: "Enter a valid email." }, { status: 400 });
    const duplicate = await councilorCollection().findOne({ email, id: { $ne: id } });
    if (duplicate) return Response.json({ error: "This email is already a councilor." }, { status: 409 });
    const item = await councilorCollection().findOneAndUpdate(
      { id },
      { $set: { email, name: email } },
      { returnDocument: "after" },
    );
    return item
      ? Response.json({ item: { ...item, assignedCount: 0, createdAt: item.createdAt.toISOString() } })
      : Response.json({ error: "Councilor not found." }, { status: 404 });
  }
  if (b?.kind === "spend") {
    const funnelId = typeof b.funnelId === "string" ? b.funnelId.trim() : "";
    const amount = Number(b.amount);
    if (!funnelId || !Number.isFinite(amount) || amount <= 0)
      return Response.json({ error: "Choose a funnel and enter a valid spend amount." }, { status: 400 });
    if (!(await funnelCollection().findOne({ id: funnelId }, { projection: { id: 1 } })))
      return Response.json({ error: "Selected funnel was not found." }, { status: 400 });
    const item = await spendCollection().findOneAndUpdate(
      { id },
      { $set: { funnelId, amount } },
      { returnDocument: "after" },
    );
    return item
      ? Response.json({ item: { ...item, createdAt: item.createdAt.toISOString() } })
      : Response.json({ error: "Spend entry not found." }, { status: 404 });
  }
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
  if (!(await canManageCustomer(session, id)))
    return Response.json({ error: "This customer is not assigned to you." }, { status: 403 });
  const allowed = ["active", "inactive"];
  const update = { ...b, updatedAt: new Date() };
  delete update.id;
  delete update.metrics;
  if ("followUps" in update) {
    const current = await customerCollection().findOne({ id }, { projection: { followUps: 1 } });
    const existing = new Map(customerFollowUps(current?.followUps).map((followUp) => [followUp.id, followUp]));
    const actor = followUpAuthor(session);
    update.followUps = customerFollowUps(update.followUps).map((followUp) => {
      const previous = existing.get(followUp.id);
      return previous &&
        previous.note === followUp.note &&
        previous.createdAt.getTime() === followUp.createdAt.getTime()
        ? previous
        : { ...followUp, ...actor };
    });
  }
  if (update.customerStatus && !allowed.includes(update.customerStatus))
    return Response.json({ error: "Invalid status." }, { status: 400 });
  const x = await customerCollection().findOneAndUpdate({ id }, { $set: update }, { returnDocument: "after" });
  if (!x) return Response.json({ error: "Customer not found." }, { status: 404 });
  return Response.json({
    item: {
      ...x,
      followUps: serializeFollowUps(x.followUps),
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
  const kind = new URL(r.url).searchParams.get("kind");
  if (kind === "councilor") {
    const session = await auth.api.getSession({ headers: r.headers });
    const access = session ? await getDashboardAccessState(session) : null;
    if (!access || (!access.bypassed && !/^(admin|super admin)$/i.test(access.roleName?.trim() ?? "")))
      return Response.json({ error: "Administrator access required." }, { status: 403 });
    const result = await councilorCollection().deleteOne({ id });
    if (!result.deletedCount) return Response.json({ error: "Councilor not found." }, { status: 404 });
    await customerCollection().updateMany(
      { councilorId: id },
      { $set: { councilorId: null, councilorEmail: null, updatedAt: new Date() } },
    );
    return Response.json({ deleted: true });
  }
  if (kind === "spend") {
    const result = await spendCollection().deleteOne({ id });
    return result.deletedCount
      ? Response.json({ deleted: true })
      : Response.json({ error: "Spend entry not found." }, { status: 404 });
  }
  if (kind === "funnel") {
    const result = await funnelCollection().deleteOne({ id });
    if (!result.deletedCount) return Response.json({ error: "Funnel not found." }, { status: 404 });
    await customerCollection().updateMany({ funnelId: id }, { $set: { funnelId: null, updatedAt: new Date() } });
    return Response.json({ deleted: true });
  }
  const session = await auth.api.getSession({ headers: r.headers });
  if (!(await canManageCustomer(session, id)))
    return Response.json({ error: "This customer is not assigned to you." }, { status: 403 });
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
