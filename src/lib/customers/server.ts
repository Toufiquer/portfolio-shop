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
  position?: number;
  color?: string;
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
  followUps?: CustomerFollowUpRecord[];
  councilorId?: string | null;
  councilorEmail?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type CouncilorRecord = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  createdAt: Date;
};
export type CustomerFollowUpRecord = {
  id: string;
  note: string;
  createdAt: Date;
  authorEmail: string;
  authorName: string;
};
export type SpendRecord = { id: string; funnelId: string; amount: number; createdAt: Date };
const db = () => client.db();
const normalize = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");
export const serialize = (v: Date | null) => v?.toISOString() ?? null;
export function metricsFor(c: CustomerRecord) {
  return db()
    .collection<Order>("orders")
    .find({
      status: { $nin: ["cancelled", "incomplete"] },
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
export const spendCollection = () => db().collection<SpendRecord>("customer-spends");
// Keep councilors in the existing application database, alongside customer growth data.
export const councilorCollection = () => db().collection<CouncilorRecord>("business-growth-councilors");
export const now = () => new Date();
export const id = () => randomUUID();
export const customerFollowUps = (value: unknown): CustomerFollowUpRecord[] =>
  Array.isArray(value)
    ? value
        .map((followUp) => {
          if (!followUp || typeof followUp !== "object") return null;
          const item = followUp as Partial<CustomerFollowUpRecord>;
          const note = typeof item.note === "string" ? item.note.trim() : "";
          const createdAt = new Date(item.createdAt ?? "");
          return note && note.length <= 2000 && !Number.isNaN(createdAt.getTime())
            ? {
                id: item.id || id(),
                note,
                createdAt,
                authorEmail: typeof item.authorEmail === "string" ? item.authorEmail.trim().toLowerCase() : "",
                authorName: typeof item.authorName === "string" ? item.authorName.trim() : "",
              }
            : null;
        })
        .filter((followUp): followUp is CustomerFollowUpRecord => Boolean(followUp))
        .slice(-100)
    : [];
export const serializeFollowUps = (value: unknown) =>
  customerFollowUps(value).map((followUp) => ({ ...followUp, createdAt: followUp.createdAt.toISOString() }));
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
  position: Number.isInteger(x.position) ? x.position : 0,
  color: /^#[0-9a-f]{6}$/i.test(x.color ?? "") ? x.color : "#d97706",
  stages: funnelStages(x.stages),
  createdAt: x.createdAt.toISOString(),
  updatedAt: x.updatedAt.toISOString(),
});
export { normalize };
