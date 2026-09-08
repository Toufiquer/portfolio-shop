/*
|-----------------------------------------
| setting up server.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { randomInt, randomUUID } from "crypto";

import { client } from "@/app/api/lib/auth";
import { type Product } from "@/lib/dashboard/catalog";
import { couponDiscount, type Coupon } from "@/lib/dashboard/coupons";
import {
  type Order,
  type OrderApiErrorCode,
  type OrderCustomer,
  type OrderItemSnapshot,
  type OrderSettings,
  type ParsedCheckout,
} from "@/lib/dashboard/orders";

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  mobileNumber?: string | null;
  address?: string | null;
};
export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; status: number; code: OrderApiErrorCode; error: string; cooldownExpiresAt?: string };

const products = () => client.db().collection<Product>("products");
const orders = () => client.db().collection<Order>("orders");
const orderSettings = () => client.db().collection<OrderSettings>("order-settings");
const coupons = () => client.db().collection<Coupon>("coupons");
const checkoutLocks = () =>
  client.db().collection<{ userId: string; token: string; expiresAt: Date }>("order-checkout-locks");
const ORDER_ID_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createOrderId() {
  const letters = Array.from({ length: 2 }, () => ORDER_ID_LETTERS[randomInt(ORDER_ID_LETTERS.length)]).join("");
  return `${letters}-${randomInt(10_000).toString().padStart(4, "0")}`;
}

function priceFor(product: Product) {
  return product.discountPrice > 0 && product.discountPrice <= product.realPrice
    ? product.discountPrice
    : product.realPrice;
}

function customerFrom(sessionUser: SessionUser, input: ParsedCheckout["customer"]): OrderCustomer | null {
  const userId = sessionUser.id?.trim();
  const email = sessionUser.email?.trim().toLowerCase();
  if (!userId || !email) return null;
  return {
    userId,
    email,
    name: sessionUser.name?.trim() || email,
    phone: input.phone || sessionUser.mobileNumber?.trim() || "",
    address: input.address || sessionUser.address?.trim() || "",
  };
}

/** Reloads each product and uses an atomic stock decrement before persistence. */
export async function getOrderSettings() {
  const existing = await orderSettings().findOne({ key: "order-settings" });
  if (!existing) {
    return {
      key: "order-settings",
      orderLimitEnabled: false,
      orderLimitMinutes: 5,
      orderLimitMaxOrders: 1,
      updatedAt: new Date(0),
      updatedBy: "system",
    } satisfies OrderSettings;
  }
  return {
    key: "order-settings",
    orderLimitEnabled: Boolean(existing.orderLimitEnabled),
    orderLimitMinutes:
      typeof existing.orderLimitMinutes === "number" && existing.orderLimitMinutes >= 1
        ? existing.orderLimitMinutes
        : 5,
    orderLimitMaxOrders:
      typeof existing.orderLimitMaxOrders === "number" && existing.orderLimitMaxOrders >= 1
        ? existing.orderLimitMaxOrders
        : 1,
    updatedAt: existing.updatedAt ?? new Date(0),
    updatedBy: existing.updatedBy ?? "system",
  } satisfies OrderSettings;
}

async function acquireCheckoutLock(userId: string) {
  await checkoutLocks().createIndex({ userId: 1 }, { name: "one_checkout_lock_per_user", unique: true });
  const token = randomUUID();
  const now = new Date();
  try {
    const updated = await checkoutLocks().updateOne(
      { userId, expiresAt: { $lte: now } },
      { $set: { userId, token, expiresAt: new Date(now.getTime() + 30_000) } },
      { upsert: true },
    );
    return updated.matchedCount || updated.upsertedCount ? token : null;
  } catch {
    return null;
  }
}

async function createOrderUnchecked(customer: OrderCustomer, input: ParsedCheckout): Promise<CreateOrderResult> {
  await orders().createIndex({ id: 1 }, { name: "unique_order_id", unique: true });
  const loaded = await Promise.all(
    input.items.map(async ({ productId }) => [productId, await products().findOne({ id: productId })] as const),
  );
  const productById = new Map(loaded);
  for (const { productId, quantity } of input.items) {
    const product = productById.get(productId);
    if (!product)
      return { ok: false, status: 404, code: "PRODUCT_NOT_FOUND", error: "One or more products no longer exist." };
    if (product.status !== "active" || product.stock < quantity)
      return {
        ok: false,
        status: 409,
        code: "PRODUCT_UNAVAILABLE",
        error: `“${product.name}” is unavailable in the requested quantity.`,
      };
  }

  const snapshots: OrderItemSnapshot[] = input.items.map(({ productId, quantity }) => {
    const product = productById.get(productId)!;
    const unitPrice = priceFor(product);
    return {
      productId: product.id,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      primaryImage: product.primaryImage,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    };
  });

  const subtotal = snapshots.reduce((sum, item) => sum + item.lineTotal, 0);
  const couponCode = input.couponCode.trim().toUpperCase();
  const coupon = couponCode ? await coupons().findOne({ code: couponCode, active: true }) : null;
  if (couponCode && !coupon)
    return { ok: false, status: 400, code: "INVALID_CHECKOUT", error: "This coupon is invalid or inactive." };
  const discount = coupon ? couponDiscount(coupon, subtotal) : 0;

  const decremented: { productId: string; quantity: number }[] = [];
  for (const item of snapshots) {
    const updated = await products().findOneAndUpdate(
      { id: item.productId, status: "active", stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!updated) {
      await Promise.all(
        decremented.map(({ productId, quantity }) =>
          products().updateOne({ id: productId }, { $inc: { stock: quantity } }),
        ),
      );
      return {
        ok: false,
        status: 409,
        code: "PRODUCT_UNAVAILABLE",
        error: `“${item.name}” is unavailable in the requested quantity.`,
      };
    }
    decremented.push({ productId: item.productId, quantity: item.quantity });
  }

  const now = new Date();
  const order: Omit<Order, "id"> = {
    customer,
    items: snapshots,
    itemCount: snapshots.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    discount,
    ...(coupon ? { couponCode: coupon.code } : {}),
    total: subtotal - discount,
    currency: "BDT",
    status: "placed",
    createdAt: now,
    updatedAt: now,
    statusUpdatedAt: now,
  };
  try {
    for (let attempt = 0; attempt < 10; attempt++) {
      const savedOrder: Order = { ...order, id: createOrderId() };
      try {
        await orders().insertOne(savedOrder);
        return { ok: true, order: savedOrder };
      } catch (error) {
        if ((error as { code?: number }).code !== 11000) throw error;
      }
    }
    throw new Error("Could not generate a unique order ID.");
  } catch (error) {
    await Promise.all(
      decremented.map(({ productId, quantity }) =>
        products().updateOne({ id: productId }, { $inc: { stock: quantity } }),
      ),
    );
    throw error;
  }
}

export async function createOrder(sessionUser: SessionUser, input: ParsedCheckout): Promise<CreateOrderResult> {
  const customer = customerFrom(sessionUser, input.customer);
  if (!customer) return { ok: false, status: 401, code: "AUTH_REQUIRED", error: "Sign in required." };
  const settings = await getOrderSettings();
  if (!settings.orderLimitEnabled) return createOrderUnchecked(customer, input);

  const token = await acquireCheckoutLock(customer.userId);
  if (!token)
    return { ok: false, status: 409, code: "CHECKOUT_IN_PROGRESS", error: "An order checkout is already in progress." };
  try {
    const limitMinutes = settings.orderLimitMinutes >= 1 ? settings.orderLimitMinutes : 5;
    const maxOrders = settings.orderLimitMaxOrders >= 1 ? settings.orderLimitMaxOrders : 1;
    const windowMs = limitMinutes * 60 * 1000;
    const windowStart = new Date(Date.now() - windowMs);

    const recentOrders = await orders()
      .find(
        {
          "customer.userId": customer.userId,
          status: { $ne: "cancelled" },
          createdAt: { $gte: windowStart },
        },
        { projection: { createdAt: 1 } },
      )
      .sort({ createdAt: 1 })
      .toArray();

    if (recentOrders.length >= maxOrders) {
      const oldestInWindow = recentOrders[recentOrders.length - maxOrders];
      const cooldownExpiresAt = new Date(oldestInWindow.createdAt.getTime() + windowMs);
      if (cooldownExpiresAt.getTime() > Date.now()) {
        const orderLabel = maxOrders === 1 ? "1 order" : `${maxOrders} orders`;
        const minuteLabel = limitMinutes === 1 ? "1 minute" : `${limitMinutes} minutes`;
        return {
          ok: false,
          status: 429,
          code: "ORDER_LIMITED",
          error: `Order limit reached: maximum ${orderLabel} every ${minuteLabel}.`,
          cooldownExpiresAt: cooldownExpiresAt.toISOString(),
        };
      }
    }
    return await createOrderUnchecked(customer, input);
  } finally {
    await checkoutLocks().deleteOne({ userId: customer.userId, token });
  }
}
