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

import { type CustomerStatus } from "@/lib/dashboard/customers";
import { type Order } from "@/lib/dashboard/orders";
import {
  councilorsCollection,
  customerSpendsCollection,
  customersCollection,
  funnelsCollection,
} from "@/lib/models/customers";
import { ordersCollection } from "@/lib/models/orders";

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
const normalize = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");
export const serialize = (v: Date | null) => v?.toISOString() ?? null;
export type CustomerMetrics = {
  amountSpent: number;
  purchaseCount: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  haveWithUs: string;
};

type OrderMetricProjection = Pick<Order, "id" | "total" | "createdAt"> & {
  customer: Pick<Order["customer"], "userId" | "email" | "phone">;
};

export async function metricsForMany(customers: CustomerRecord[]) {
  const customerIds = customers.map((customer) => customer.id);
  const emails = [...new Set(customers.map((customer) => normalize(customer.email)).filter(Boolean))];
  const phones = [...new Set(customers.map((customer) => customer.mobileNumber).filter(Boolean))];
  const selectors = [
    ...(customerIds.length ? [{ "customer.userId": { $in: customerIds } }] : []),
    ...(emails.length ? [{ "customer.email": { $in: emails } }] : []),
    ...(phones.length ? [{ "customer.phone": { $in: phones } }] : []),
  ];
  const byId = new Map(customerIds.map((id) => [id, [] as OrderMetricProjection[]]));
  if (!selectors.length) return new Map<string, CustomerMetrics>();
  const customersByEmail = new Map<string, string[]>();
  const customersByPhone = new Map<string, string[]>();
  for (const customer of customers) {
    const email = normalize(customer.email);
    if (email) customersByEmail.set(email, [...(customersByEmail.get(email) ?? []), customer.id]);
    if (customer.mobileNumber)
      customersByPhone.set(customer.mobileNumber, [
        ...(customersByPhone.get(customer.mobileNumber) ?? []),
        customer.id,
      ]);
  }

  const orders = await ordersCollection()
    .find(
      { status: { $nin: ["cancelled", "incomplete"] }, $or: selectors },
      {
        projection: {
          _id: 0,
          id: 1,
          total: 1,
          createdAt: 1,
          "customer.userId": 1,
          "customer.email": 1,
          "customer.phone": 1,
        },
      },
    )
    .toArray();

  for (const order of orders) {
    const matches = new Set<string>();
    const userId = order.customer?.userId;
    const email = normalize(order.customer?.email);
    const phone = order.customer?.phone;
    if (userId && byId.has(userId)) matches.add(userId);
    for (const id of customersByEmail.get(email) ?? []) matches.add(id);
    for (const id of customersByPhone.get(phone) ?? []) matches.add(id);
    for (const id of matches) byId.get(id)?.push(order);
  }

  return new Map(
    customers.map((customer) => {
      const matches = byId.get(customer.id) ?? [];
      let first: Date | null = null;
      let last: Date | null = null;
      let amountSpent = 0;
      for (const order of matches) {
        const date = new Date(order.createdAt);
        if (!first || date < first) first = date;
        if (!last || date > last) last = date;
        amountSpent += order.total;
      }
      const base = first ?? customer.createdAt;
      const days = Math.max(0, Math.floor((Date.now() - base.getTime()) / 86400000));
      return [
        customer.id,
        {
          amountSpent,
          purchaseCount: matches.length,
          firstOrderAt: serialize(first),
          lastOrderAt: serialize(last),
          haveWithUs: `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m ${days % 30}d`,
        },
      ];
    }),
  );
}

export async function metricsFor(customer: CustomerRecord) {
  return (await metricsForMany([customer])).get(customer.id)!;
}
export const customerCollection = customersCollection;
export const funnelCollection = funnelsCollection;
export const spendCollection = customerSpendsCollection;
// Keep councilors in the existing application database, alongside customer growth data.
export const councilorCollection = councilorsCollection;
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
