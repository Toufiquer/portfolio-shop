/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { parseCheckoutInput, serializeOrder, validatePhoneNumber } from "@/lib/dashboard/orders";
import { orders } from "@/lib/orders/management";
import { createOrder } from "@/lib/orders/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!/^[A-Z]{2}-\d{4}$/.test(id)) return Response.json({ error: "Invalid order ID." }, { status: 400 });
  const order = await orders().findOne({ id, "customer.userId": session.user.id });
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ order: serializeOrder(order) });
}

export async function POST(request: Request) {
  const limited = await rateLimitDistributed(request, "order-checkout", 12, 60_000);
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ ok: false, code: "AUTH_REQUIRED", error: "Sign in required." }, { status: 401 });
  const parsed = parseCheckoutInput(await request.json().catch(() => null));
  if ("code" in parsed) return Response.json({ ok: false, ...parsed }, { status: 400 });
  const result = await createOrder(session.user, parsed, "incomplete");
  return result.ok
    ? Response.json({ ok: true, order: serializeOrder(result.order) }, { status: 201 })
    : Response.json(
        { ok: false, code: result.code, error: result.error, cooldownExpiresAt: result.cooldownExpiresAt },
        { status: result.status },
      );
}

export async function PATCH(request: Request) {
  const limited = await rateLimitDistributed(request, "order-checkout", 12, 60_000);
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    customer?: { phone?: unknown; address?: unknown };
  } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const phone = typeof body?.customer?.phone === "string" ? body.customer.phone.trim() : "";
  const address = typeof body?.customer?.address === "string" ? body.customer.address.trim() : "";
  if (!/^[A-Z]{2}-\d{4}$/.test(id) || address.length > 500 || !validatePhoneNumber(phone).isValid)
    return Response.json({ ok: false, error: "Enter a valid order ID and phone number." }, { status: 400 });
  const now = new Date();
  const updated = await orders().findOneAndUpdate(
    { id, "customer.userId": session.user.id, status: "incomplete" },
    {
      $set: {
        "customer.phone": phone,
        "customer.address": address,
        status: "placed",
        updatedAt: now,
        statusUpdatedAt: now,
      },
    },
    { returnDocument: "after" },
  );
  return updated
    ? Response.json({ ok: true, order: serializeOrder(updated) })
    : Response.json({ ok: false, error: "This incomplete order is no longer available." }, { status: 409 });
}
