/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 09 September, 2026
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { MongoServerError } from "mongodb";

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { parseCouponInput, serializeCoupon, type Coupon } from "@/lib/dashboard/coupons";

const coupons = () => client.db().collection<Coupon>("coupons");

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

export async function ensureCouponIndexes() {
  await coupons().createIndex({ code: 1 }, { name: "coupon_code_unique", unique: true });
}

export async function GET(request: Request) {
  const access = await authorizeCouponRequest(request, "GET");
  if ("error" in access) return access.error;
  const items = await coupons().find({}).sort({ createdAt: -1 }).toArray();
  return Response.json({ items: items.map(serializeCoupon) });
}

export async function POST(request: Request) {
  const access = await authorizeCouponRequest(request, "POST");
  if ("error" in access) return access.error;
  const data = parseCouponInput(await request.json().catch(() => null));
  if (!data) return Response.json({ error: "Enter a valid coupon code and discount." }, { status: 400 });
  const now = new Date();
  const item: Coupon = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
  try {
    await ensureCouponIndexes();
    await coupons().insertOne(item);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000)
      return Response.json({ error: "That coupon code already exists." }, { status: 409 });
    throw error;
  }
  return Response.json({ item: serializeCoupon(item) }, { status: 201 });
}
