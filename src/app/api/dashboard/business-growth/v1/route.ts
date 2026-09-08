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
  id,
  metricsFor,
  normalize,
  now,
  spendCollection,
  type CustomerRecord,
  type CouncilorRecord,
  type Funnel,
  type SpendRecord,
  serializeFunnel,
  serializeFollowUps,
} from "@/lib/customers/server";
import { customerStatuses } from "@/lib/dashboard/customers";
const guard = async (r: Request, method: "GET" | "POST") => {
  const limited = rateLimit(r, "customer-api");
  if (limited) return limited;
  const s = await auth.api.getSession({ headers: r.headers });
  if (!s) return Response.json({ error: "Sign in required." }, { status: 401 });
  const a = await authorizeDashboardRequest(s, "/api/dashboard/business-growth/v1", method);
  return a.allowed ? null : Response.json({ error: a.state.message ?? "Unauthorized." }, { status: 403 });
};
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim().length <= max ? v.trim() : "");
const customerStatus = (value: unknown) => (value === "inactive" || value === "archived" ? "inactive" : "active");
const followUpAuthor = (session: { user?: { email?: unknown; name?: unknown } } | null) => ({
  authorEmail: typeof session?.user?.email === "string" ? session.user.email.trim().toLowerCase() : "",
  authorName: typeof session?.user?.name === "string" ? session.user.name.trim() : "",
});
const isAdministrator = (roleName: string | null) => /^(admin|super admin)$/i.test(roleName?.trim() ?? "");
async function sessionAccess(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return { session, access: session ? await getDashboardAccessState(session) : null };
}
export async function GET(r: Request) {
  const g = await guard(r, "GET");
  if (g) return g;
  const q = new URL(r.url).searchParams;
  const kind = q.get("kind") ?? "customers";
  const { session, access } = await sessionAccess(r);
  if (!session || !access) return Response.json({ error: "Sign in required." }, { status: 401 });
  const admin = access.bypassed || isAdministrator(access.roleName);
  if (kind === "workspace")
    return Response.json({
      isAdmin: admin,
      isCouncilor: Boolean(
        await councilorCollection().findOne({
          $or: [{ userId: session.user.id }, { email: normalize(session.user.email) }],
        }),
      ),
    });
  if (kind === "councilors") {
    if (!admin) return Response.json({ error: "Administrator access required." }, { status: 403 });
    const items = await councilorCollection().find({}).sort({ createdAt: -1 }).toArray();
    const counts = new Map(
      (
        await customerCollection()
          .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$councilorId", count: { $sum: 1 } } }])
          .toArray()
      ).map((row) => [row._id, row.count]),
    );
    const statusCounts = new Map(
      (
        await customerCollection()
          .aggregate<{ _id: { councilorId: string; status: "active" | "inactive" }; count: number }>([
            { $match: { councilorId: { $exists: true, $ne: null } } },
            {
              $project: {
                councilorId: 1,
                status: {
                  $cond: [{ $in: ["$customerStatus", ["inactive", "archived"]] }, "inactive", "active"],
                },
              },
            },
            { $group: { _id: { councilorId: "$councilorId", status: "$status" }, count: { $sum: 1 } } },
          ])
          .toArray()
      ).map((row) => [`${row._id.councilorId}:${row._id.status}`, row.count]),
    );
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const counsellingCounts = new Map(
      (
        await customerCollection()
          .aggregate<{ _id: string; count: number }>([
            { $match: { councilorId: { $exists: true, $ne: null } } },
            { $unwind: "$followUps" },
            { $match: { "followUps.createdAt": { $gte: last24Hours } } },
            { $group: { _id: "$councilorId", count: { $sum: 1 } } },
          ])
          .toArray()
      ).map((row) => [row._id, row.count]),
    );
    return Response.json({
      items: items.map((item) => ({
        ...item,
        assignedCount: counts.get(item.id) ?? 0,
        activeCount: statusCounts.get(`${item.id}:active`) ?? 0,
        inactiveCount: statusCounts.get(`${item.id}:inactive`) ?? 0,
        counsellingLast24Hours: counsellingCounts.get(item.id) ?? 0,
        createdAt: item.createdAt.toISOString(),
      })),
    });
  }
  if (kind === "funnels") {
    const legacy = await funnelCollection()
      .find({ position: { $exists: false } })
      .sort({ createdAt: 1 })
      .toArray();
    if (legacy.length) {
      const offset = await funnelCollection().countDocuments({ position: { $exists: true } });
      await funnelCollection().bulkWrite(
        legacy.map((funnel, index) => ({
          updateOne: { filter: { id: funnel.id }, update: { $set: { position: offset + index } } },
        })),
      );
    }
    const items = await funnelCollection().find({}).sort({ position: 1, createdAt: 1 }).toArray();
    return Response.json({
      items: items.map(serializeFunnel),
    });
  }
  if (kind === "spends") {
    const items = await spendCollection().find({}).sort({ createdAt: -1 }).limit(200).toArray();
    return Response.json({ items: items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })) });
  }
  if (kind === "overview") {
    const current = new Date();
    const monthStart = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 5, 1));
    const last30 = new Date(current.getTime() - 30 * 86400000);
    const previous30 = new Date(current.getTime() - 60 * 86400000);
    const [total, statuses, funnelCounts, monthlyRows, newLast30, newPrevious30, spendRows] = await Promise.all([
      customerCollection().countDocuments(),
      customerCollection()
        .aggregate<{ _id: string; count: number }>([
          {
            $project: {
              normalizedStatus: {
                $cond: [{ $in: ["$customerStatus", ["inactive", "archived"]] }, "inactive", "active"],
              },
            },
          },
          { $group: { _id: "$normalizedStatus", count: { $sum: 1 } } },
        ])
        .toArray(),
      customerCollection()
        .aggregate<{ _id: string | null; count: number }>([{ $group: { _id: "$funnelId", count: { $sum: 1 } } }])
        .toArray(),
      customerCollection()
        .aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: monthStart } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        ])
        .toArray(),
      customerCollection().countDocuments({ createdAt: { $gte: last30 } }),
      customerCollection().countDocuments({ createdAt: { $gte: previous30, $lt: last30 } }),
      spendCollection()
        .aggregate<{ _id: string; amount: number }>([{ $group: { _id: "$funnelId", amount: { $sum: "$amount" } } }])
        .toArray(),
    ]);
    const funnels = await funnelCollection()
      .find({}, { projection: { id: 1, name: 1, color: 1, minimumAmount: 1, maximumAmount: 1 } })
      .toArray();
    const counts = new Map(funnelCounts.map((item) => [item._id, item.count]));
    const spends = new Map(spendRows.map((item) => [item._id, item.amount]));
    const monthlyCounts = new Map(monthlyRows.map((item) => [item._id, item.count]));
    const monthly = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 5 + index, 1));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      return {
        label: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
        count: monthlyCounts.get(key) ?? 0,
      };
    });
    return Response.json({
      total,
      statuses,
      funnels: funnels.map((funnel) => {
        const minimum = Number(funnel.minimumAmount);
        const maximum = funnel.maximumAmount == null ? null : Number(funnel.maximumAmount);
        const rangeAverage =
          Number.isFinite(minimum) && minimum >= 0 && Number.isFinite(maximum) && maximum !== null && maximum >= minimum
            ? Math.round((minimum + maximum) / 2)
            : 0;
        const averageReturn = funnel.name.trim().toLocaleLowerCase() === "vip customer" ? 5000 : rangeAverage;
        return {
          id: funnel.id,
          name: funnel.name,
          color: funnel.color || "#d97706",
          count: counts.get(funnel.id) ?? 0,
          spend: spends.get(funnel.id) ?? 0,
          averageReturn,
          estimatedReturn: (counts.get(funnel.id) ?? 0) * averageReturn,
        };
      }),
      unassigned: counts.get(null) ?? 0,
      monthly,
      newLast30,
      newPrevious30,
    });
  }
  const search = normalize(q.get("search"));
  const status = q.get("status");
  const funnelId = q.get("funnelId");
  const assignment = q.get("assignment");
  const pageSize = Math.min(100, Math.max(10, Number.parseInt(q.get("pageSize") ?? "25", 10) || 25));
  const councilorOnly = kind === "tasks";
  if (
    councilorOnly &&
    !admin &&
    !(await councilorCollection().findOne({
      $or: [{ userId: session.user.id }, { email: normalize(session.user.email) }],
    }))
  )
    return Response.json({ error: "Councilor access required." }, { status: 403 });
  const filter: Record<string, unknown> = {
    ...(councilorOnly ? { councilorEmail: normalize(session.user.email) } : {}),
    ...(status && customerStatuses.includes(status as never)
      ? { customerStatus: status === "active" ? { $in: ["active", "lead"] } : { $in: ["inactive", "archived"] } }
      : {}),
    ...(funnelId ? { funnelId } : {}),
    ...(assignment === "assigned" ? { councilorId: { $exists: true, $ne: null } } : {}),
    ...(assignment === "unassigned"
      ? { $and: [{ $or: [{ councilorId: { $exists: false } }, { councilorId: null }] }] }
      : {}),
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
  const assignmentFilter = councilorOnly ? { councilorEmail: normalize(session.user.email) } : filter;
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, assigned, active, inactive, counsellingRows] = await Promise.all([
    customerCollection().countDocuments(filter),
    customerCollection().countDocuments(assignmentFilter),
    customerCollection().countDocuments({ ...assignmentFilter, customerStatus: { $in: ["active", "lead"] as never } }),
    customerCollection().countDocuments({
      ...assignmentFilter,
      customerStatus: { $in: ["inactive", "archived"] as never },
    }),
    customerCollection()
      .aggregate<{ count: number }>([
        { $match: assignmentFilter },
        { $unwind: "$followUps" },
        { $match: { "followUps.createdAt": { $gte: last24Hours } } },
        { $count: "count" },
      ])
      .toArray(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const requestedPage = Math.max(1, Number.parseInt(q.get("page") ?? "1", 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  const items = await customerCollection()
    .find(filter)
    .sort({ updatedAt: -1, id: 1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
  return Response.json({
    items: await Promise.all(
      items.map(async (x) => ({
        ...x,
        followUps: serializeFollowUps(x.followUps),
        customerStatus: customerStatus(x.customerStatus),
        createdAt: x.createdAt.toISOString(),
        updatedAt: x.updatedAt.toISOString(),
        metrics: await metricsFor(x),
      })),
    ),
    total,
    page,
    pageSize,
    summary: {
      assigned,
      active,
      inactive,
      counsellingLast24Hours: counsellingRows[0]?.count ?? 0,
    },
  });
}
export async function POST(r: Request) {
  const g = await guard(r, "POST");
  if (g) return g;
  const session = await auth.api.getSession({ headers: r.headers });
  const b = (await r.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = b?.kind ?? "customer";
  const access = await getDashboardAccessState(session!);
  const admin = access.bypassed || isAdministrator(access.roleName);
  if (kind === "councilor") {
    if (!admin) return Response.json({ error: "Administrator access required." }, { status: 403 });
    const email = normalize(b?.email);
    if (!email) return Response.json({ error: "Enter a valid user email." }, { status: 400 });
    const existing = await councilorCollection().findOne({ email });
    if (existing) return Response.json({ error: "This email is already a councilor." }, { status: 409 });
    const item: CouncilorRecord = { id: id(), name: email, email, createdAt: now() };
    await councilorCollection().insertOne(item);
    return Response.json({ item: { ...item, createdAt: item.createdAt.toISOString() } }, { status: 201 });
  }
  if (kind === "demo-spends") {
    const funnels = await funnelCollection().find({}).sort({ position: 1, createdAt: 1 }).limit(5).toArray();
    if (funnels.length < 5)
      return Response.json({ error: "Create all five funnels before importing demo spend." }, { status: 400 });
    const amounts = [[500, 500, 500, 500, 500, 500], [375, 375, 375, 375], [125, 125], [150], [100]];
    const items: SpendRecord[] = amounts.flatMap((entries, funnelIndex) =>
      entries.map((amount) => ({ id: id(), funnelId: funnels[funnelIndex].id, amount, createdAt: now() })),
    );
    await spendCollection().insertMany(items);
    return Response.json({ createdCount: items.length }, { status: 201 });
  }
  if (kind === "spend") {
    const funnelId = text(b?.funnelId, 80);
    const amount = Number(b?.amount);
    if (!funnelId || !Number.isFinite(amount) || amount <= 0)
      return Response.json({ error: "Choose a funnel and enter a valid spend amount." }, { status: 400 });
    if (!(await funnelCollection().findOne({ id: funnelId }, { projection: { id: 1 } })))
      return Response.json({ error: "Selected funnel was not found." }, { status: 400 });
    const item: SpendRecord = { id: id(), funnelId, amount, createdAt: now() };
    await spendCollection().insertOne(item);
    return Response.json({ item: { ...item, createdAt: item.createdAt.toISOString() } }, { status: 201 });
  }
  if (kind === "funnel") {
    const name = text(b?.name, 120);
    const min = Number(b?.minimumAmount);
    const max = b?.maximumAmount == null || b.maximumAmount === "" ? null : Number(b.maximumAmount);
    const color = typeof b?.color === "string" && /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "#d97706";
    if (!name || !Number.isFinite(min) || min < 0 || (max !== null && (!Number.isFinite(max) || max < min)))
      return Response.json({ error: "Invalid funnel values." }, { status: 400 });
    const x: Funnel = {
      id: id(),
      position: await funnelCollection().countDocuments(),
      color,
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
  if (!name || (!email && !mobile && !wa))
    return Response.json({ error: "Name and a phone number or email are required." }, { status: 400 });
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
    customerStatus: customerStatuses.includes(b?.customerStatus as never) ? (b?.customerStatus as never) : "active",
    tags: Array.isArray(b?.tags) ? b.tags.filter((v): v is string => typeof v === "string").slice(0, 30) : [],
    followUps: customerFollowUps(b?.followUps).map((followUp) => ({ ...followUp, ...followUpAuthor(session) })),
    createdAt: now(),
    updatedAt: now(),
  };
  await customerCollection().insertOne(x);
  return Response.json(
    {
      item: {
        ...x,
        followUps: serializeFollowUps(x.followUps),
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
