/*
|-----------------------------------------
| setting up server.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 7 September, 2026
|-----------------------------------------
*/

/*
|-----------------------------------------
| customer server persistence and metrics
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { client } from "@/app/api/lib/auth";
import { type CustomerStatus } from "@/lib/dashboard/customers";
import { type Order } from "@/lib/dashboard/orders";

export type FunnelStage = { id: string; name: string };
export type Funnel = {
  id: string;
  name: string;
  description: string;
  minimumAmount: number;
  maximumAmount: number | null;
  stages: FunnelStage[];
  createdAt: Date;
  updatedAt: Date;
};
export type CustomerRecord = {
  id: string;
  funnelId: string | null;
  name: string;
  email: string;
  address: string;
  whatsappNumber: string;
  mobileNumber: string;
  source: string;
  author: string;
  notes: string;
  customerStatus: CustomerStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};
const db = () => client.db();
const normalize = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");
export const serialize = (v: Date | null) => v?.toISOString() ?? null;
export function metricsFor(c: CustomerRecord) {
  return db()
    .collection<Order>("orders")
    .find({
      status: { $ne: "cancelled" },
      $or: [
        { "customer.userId": c.id },
        ...(c.email ? [{ "customer.email": normalize(c.email) }] : []),
        ...(c.mobileNumber ? [{ "customer.phone": c.mobileNumber }] : []),
      ],
    })
    .toArray()
    .then((items) => {
      const dates = items.map((x) => new Date(x.createdAt)).sort((a, b) => a.getTime() - b.getTime());
      const first = dates[0] ?? null;
      const last = dates.at(-1) ?? null;
      const base = first ?? c.createdAt;
      const days = Math.max(0, Math.floor((Date.now() - base.getTime()) / 86400000));
      return {
        amountSpent: items.reduce((s, x) => s + x.total, 0),
        purchaseCount: items.length,
        firstOrderAt: serialize(first),
        lastOrderAt: serialize(last),
        haveWithUs: `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m ${days % 30}d`,
      };
    });
}
export const customerCollection = () => db().collection<CustomerRecord>("customers");
export const funnelCollection = () => db().collection<Funnel>("customer-funnels");
export const now = () => new Date();
export const id = () => randomUUID();
export const funnelStages = (value: unknown): FunnelStage[] =>
  Array.isArray(value)
    ? value
        .map((stage, index) => {
          if (typeof stage === "string" && stage.trim()) return { id: `legacy-${index}`, name: stage.trim() };
          if (stage && typeof stage === "object" && typeof (stage as FunnelStage).name === "string") {
            const name = (stage as FunnelStage).name.trim();
            return name ? { id: (stage as FunnelStage).id || id(), name } : null;
          }
          return null;
        })
        .filter((stage): stage is FunnelStage => Boolean(stage))
        .slice(0, 12)
    : [];
export const serializeFunnel = (x: Funnel) => ({
  ...x,
  stages: funnelStages(x.stages),
  createdAt: x.createdAt.toISOString(),
  updatedAt: x.updatedAt.toISOString(),
});
export { normalize };
