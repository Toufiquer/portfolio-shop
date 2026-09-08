/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 08 September, 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";
import {
  councilorCollection,
  customerCollection,
  funnelCollection,
  id,
  now,
  normalize,
  spendCollection,
  type CustomerRecord,
} from "@/lib/customers/server";
import { type Product } from "@/lib/dashboard/catalog";
import { customerStatuses, type CustomerStatus } from "@/lib/dashboard/customers";
import { type Order, type OrderItemSnapshot } from "@/lib/dashboard/orders";
import { orders } from "@/lib/orders/management";

async function guard(request: Request, method: "POST" | "PATCH" | "DELETE") {
  const limited = rateLimit(request, "customer-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const access = await authorizeDashboardRequest(session, "/api/dashboard/business-growth/v1", method);
  return access.allowed ? null : Response.json({ error: access.state.message ?? "Unauthorized." }, { status: 403 });
}
const text = (value: unknown, max: number) =>
  typeof value === "string" && value.trim().length <= max ? value.trim() : "";
const ids = (body: { ids?: unknown } | null) =>
  Array.isArray(body?.ids)
    ? [
        ...new Set(
          body.ids
            .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
            .map((value) => value.trim()),
        ),
      ].slice(0, 100)
    : [];

export async function PATCH(request: Request) {
  const denied = await guard(request, "PATCH");
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as {
    ids?: unknown;
    status?: unknown;
    funnelId?: unknown;
    councilorId?: unknown;
  } | null;
  const selected = ids(body);
  if (!selected.length) return Response.json({ error: "Select up to 100 customers." }, { status: 400 });
  if (body?.councilorId !== undefined) {
    const session = await auth.api.getSession({ headers: request.headers });
    const access = session ? await getDashboardAccessState(session) : null;
    if (!access || (!access.bypassed && !/^(admin|super admin)$/i.test(access.roleName?.trim() ?? "")))
      return Response.json({ error: "Administrator access required." }, { status: 403 });
    const councilorId = typeof body.councilorId === "string" ? body.councilorId.trim() : "";
    const councilor = councilorId ? await councilorCollection().findOne({ id: councilorId }) : null;
    if (councilorId && !councilor) return Response.json({ error: "Choose a valid councilor." }, { status: 400 });
    const result = await customerCollection().updateMany(
      { id: { $in: selected } },
      { $set: { councilorId: councilorId || null, councilorEmail: councilor?.email ?? null, updatedAt: now() } },
    );
    return Response.json({ updatedCount: result.modifiedCount });
  }
  if (!customerStatuses.includes(body?.status as CustomerStatus))
    return Response.json({ error: "Select a valid status." }, { status: 400 });
  const hasFunnelChange = body?.funnelId !== undefined;
  const funnelId = typeof body?.funnelId === "string" && body.funnelId.trim() ? body.funnelId.trim() : null;
  if (funnelId && !(await funnelCollection().findOne({ id: funnelId }, { projection: { id: 1 } })))
    return Response.json({ error: "Choose a valid funnel." }, { status: 400 });
  const result = await customerCollection().updateMany(
    { id: { $in: selected } },
    {
      $set: {
        customerStatus: body!.status as CustomerStatus,
        ...(hasFunnelChange ? { funnelId } : {}),
        updatedAt: now(),
      },
    },
  );
  return Response.json({ updatedCount: result.modifiedCount });
}
export async function DELETE(request: Request) {
  const denied = await guard(request, "DELETE");
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as { ids?: unknown; kind?: unknown } | null;
  const selected = ids(body);
  if (!selected.length) return Response.json({ error: "Select up to 100 items." }, { status: 400 });
  if (body?.kind === "funnels") {
    const result = await funnelCollection().deleteMany({ id: { $in: selected } });
    await customerCollection().updateMany(
      { funnelId: { $in: selected } },
      { $set: { funnelId: null, updatedAt: now() } },
    );
    return Response.json({ deletedCount: result.deletedCount });
  }
  if (body?.kind === "spends") {
    const result = await spendCollection().deleteMany({ id: { $in: selected } });
    return Response.json({ deletedCount: result.deletedCount });
  }
  const result = await customerCollection().deleteMany({ id: { $in: selected } });
  return Response.json({ deletedCount: result.deletedCount });
}
export async function POST(request: Request) {
  const denied = await guard(request, "POST");
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as { kind?: unknown; rows?: unknown } | null;
  const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 500) : [];
  if (!rows.length) return Response.json({ error: "No import rows supplied." }, { status: 400 });
  const valid: CustomerRecord[] = [];
  for (const row of rows) {
    const data = row as Record<string, unknown>;
    const name = text(data.name, 120);
    const mobileNumber = text(data.mobileNumber ?? data.number, 40);
    const whatsappNumber = text(data.whatsappNumber, 40);
    const email = normalize(data.email);
    if (!name || (!mobileNumber && !whatsappNumber && !email)) continue;
    valid.push({
      id: id(),
      funnelId: text(data.funnelId, 80) || null,
      name,
      email,
      address: text(data.address, 500),
      whatsappNumber,
      mobileNumber,
      source: text(data.source, 120),
      author: text(data.author, 120),
      notes: text(data.notes, 2000),
      customerStatus: customerStatuses.includes(data.customerStatus as CustomerStatus)
        ? (data.customerStatus as CustomerStatus)
        : "active",
      tags: Array.isArray(data.tags)
        ? data.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 30)
        : [],
      createdAt: now(),
      updatedAt: now(),
    });
  }
  const result = valid.length
    ? await customerCollection()
        .insertMany(valid, { ordered: false })
        .catch(() => null)
    : null;
  const imported = result?.insertedCount ?? 0;
  if (body?.kind !== "demo-with-orders" || !imported)
    return Response.json({ imported, skipped: rows.length - imported });

  const products = await client
    .db()
    .collection<Product>("products")
    .find({ status: "active", stock: { $gt: 0 } })
    .toArray();
  const funnelPositions = new Map(
    (
      await funnelCollection()
        .find({}, { projection: { id: 1, position: 1 } })
        .toArray()
    ).map((funnel) => [funnel.id, Number.isInteger(funnel.position) ? funnel.position : 0]),
  );
  if (!products.length)
    return Response.json({
      imported,
      skipped: rows.length - imported,
      ordersCreated: 0,
      warning: "No in-stock products found.",
    });
  const stockById = new Map(products.map((product) => [product.id, product.stock]));
  const demoOrders: Order[] = [];
  for (const customer of valid.slice(0, imported)) {
    const product = products.find((item) => (stockById.get(item.id) ?? 0) > 0);
    if (!product) break;
    const available = stockById.get(product.id) ?? 0;
    const position = customer.funnelId ? (funnelPositions.get(customer.funnelId) ?? 0) : 0;
    const quantity = Math.min(available, position >= 4 ? 3 : position >= 2 ? 2 : 1);
    const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.realPrice;
    const item: OrderItemSnapshot = {
      productId: product.id,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      primaryImage: product.primaryImage,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    };
    const createdAt = now();
    demoOrders.push({
      id: `DM-${id().slice(0, 4).toUpperCase()}`,
      customer: {
        userId: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.mobileNumber || customer.whatsappNumber,
        address: customer.address,
      },
      items: [item],
      itemCount: quantity,
      subtotal: item.lineTotal,
      total: item.lineTotal,
      currency: "BDT",
      status: "completed",
      createdAt,
      updatedAt: createdAt,
      statusUpdatedAt: createdAt,
    });
    stockById.set(product.id, available - quantity);
  }
  if (demoOrders.length) {
    await orders().insertMany(demoOrders);
    await Promise.all(
      products.map((product) =>
        client
          .db()
          .collection<Product>("products")
          .updateOne({ id: product.id }, { $set: { stock: stockById.get(product.id) ?? 0, updatedAt: now() } }),
      ),
    );
  }
  return Response.json({ imported, skipped: rows.length - imported, ordersCreated: demoOrders.length });
}
