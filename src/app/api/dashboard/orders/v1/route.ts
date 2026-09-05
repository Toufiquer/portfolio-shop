/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { auth } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { orderStatuses, serializeOrder } from "@/lib/dashboard/orders";
import { orders } from "@/lib/orders/management";

async function access(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };
  const allowed = await authorizeDashboardRequest(session, "/api/dashboard/orders/v1", "GET");
  return allowed.allowed
    ? {}
    : { error: Response.json({ error: allowed.state.message ?? "Unauthorized." }, { status: 403 }) };
}

export async function GET(request: Request) {
  const authorized = await access(request);
  if ("error" in authorized) return authorized.error;
  const query = new URL(request.url).searchParams;
  const status = query.get("status");
  const selectedStatus = orderStatuses.find((orderStatus) => orderStatus === status);
  const filter = selectedStatus ? { status: selectedStatus } : {};
  const items = await orders().find(filter).sort({ createdAt: -1 }).limit(250).toArray();
  return Response.json({ items: items.map(serializeOrder) });
}
