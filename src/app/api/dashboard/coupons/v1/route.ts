/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 09 September, 2026
|-----------------------------------------
*/

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { parseCouponInput, serializeCoupon } from "@/lib/dashboard/coupons";
import { createCouponForApi, ensureCouponIndexes, listCouponsForApi } from "@/lib/services/coupons";

export async function authorizeCouponRequest(request: Request, method: "GET" | "POST" | "PATCH" | "DELETE") {
  const limited = await rateLimitDistributed(request, "dashboard-coupons-api", 60, 60_000);
  if (limited) return { error: limited };
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };
  const allowed = await authorizeDashboardRequest(session, "/api/dashboard/coupons/v1", method);
  return allowed.allowed
    ? {}
    : { error: Response.json({ error: allowed.state.message ?? "Unauthorized." }, { status: 403 }) };
}

export { ensureCouponIndexes };

export async function GET(request: Request) {
  const access = await authorizeCouponRequest(request, "GET");
  if ("error" in access) return access.error;
  return Response.json({ items: await listCouponsForApi() });
}

export async function POST(request: Request) {
  const access = await authorizeCouponRequest(request, "POST");
  if ("error" in access) return access.error;
  const data = parseCouponInput(await request.json().catch(() => null));
  if (!data) return Response.json({ error: "Enter a valid coupon code and discount." }, { status: 400 });
  const result = await createCouponForApi(data);
  if (result.kind === "duplicate") return Response.json({ error: "That coupon code already exists." }, { status: 409 });
  return Response.json({ item: serializeCoupon(result.item) }, { status: 201 });
}
