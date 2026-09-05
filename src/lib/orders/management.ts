/*
|-----------------------------------------
| setting up management.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { client } from "@/app/api/lib/auth";
import { type Order, type OrderStatus } from "@/lib/dashboard/orders";

export const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const orders = () => client.db().collection<Order>("orders");

export function orderIds(body: unknown) {
  const ids = (body as { ids?: unknown } | null)?.ids;
  return Array.isArray(ids)
    ? [
        ...new Set(
          ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0).map((id) => id.trim()),
        ),
      ]
    : [];
}

export async function restoreOrderStock(order: Order, now = new Date()) {
  if (order.status === "cancelled") return;
  await Promise.all(
    order.items.map((item) =>
      client
        .db()
        .collection("products")
        .updateOne({ id: item.productId }, { $inc: { stock: item.quantity }, $set: { updatedAt: now } }),
    ),
  );
}
