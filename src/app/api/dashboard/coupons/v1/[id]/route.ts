/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 09 September, 2026
|-----------------------------------------
*/

import { MongoServerError } from "mongodb";

import { authorizeCouponRequest, ensureCouponIndexes } from "@/app/api/dashboard/coupons/v1/route";
import { client } from "@/app/api/lib/auth";
import { parseCouponInput, serializeCoupon, type Coupon } from "@/lib/dashboard/coupons";

const coupons = () => client.db().collection<Coupon>("coupons");

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeCouponRequest(request, "PATCH");
  if ("error" in access) return access.error;
  const data = parseCouponInput(await request.json().catch(() => null));
  if (!data) return Response.json({ error: "Enter a valid coupon code and discount." }, { status: 400 });
  const { id } = await params;
  try {
    await ensureCouponIndexes();
    const item = await coupons().findOneAndUpdate(
      { id },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    return item
      ? Response.json({ item: serializeCoupon(item) })
      : Response.json({ error: "Coupon not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000)
      return Response.json({ error: "That coupon code already exists." }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeCouponRequest(request, "DELETE");
  if ("error" in access) return access.error;
  const { id } = await params;
  const removed = await coupons().deleteOne({ id });
  return removed.deletedCount
    ? Response.json({ ok: true })
    : Response.json({ error: "Coupon not found." }, { status: 404 });
}
