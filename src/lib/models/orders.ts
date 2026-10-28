/*
|-----------------------------------------
| setting up Order.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import "server-only";

import type { Order, OrderSettings } from "@/lib/dashboard/orders";
import { database } from "@/lib/db";

export const ordersCollection = () => database().collection<Order>("orders");
export const orderSettingsCollection = () => database().collection<OrderSettings>("order-settings");
export const checkoutLocksCollection = () =>
  database().collection<{ userId: string; token: string; expiresAt: Date }>("order-checkout-locks");
