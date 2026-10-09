/*
|-----------------------------------------
| setting up Leads persistence using the shared database
| @author: Codex
|-----------------------------------------
*/

import "server-only";

import type { LeadItem, LeadKind } from "@/lib/dashboard/leads";
import { database } from "@/lib/db";

export type LeadDocument<T extends LeadItem = LeadItem> = T extends LeadItem
  ? Omit<T, "createdAt" | "updatedAt"> & { createdAt: Date; updatedAt: Date }
  : never;
export type LeadActivity = {
  id: string;
  customerId: string;
  councilor: string;
  type: "assigned" | "counselled";
  createdAt: Date;
};
export const leadsCollection = (kind: LeadKind) => database().collection<LeadDocument>(`leads-${kind}`);
export const leadActivitiesCollection = () => database().collection<LeadActivity>("leads-activities");
let indexesReady: Promise<unknown> | undefined;
export async function ensureLeadIndexes() {
  indexesReady ??= Promise.all([
    ...(["funnels", "customers", "councilors"] as const).map((kind) =>
      leadsCollection(kind).createIndex({ id: 1 }, { unique: true }),
    ),
    leadsCollection("funnels").createIndex({ position: 1 }, { unique: true }),
    leadsCollection("customers").createIndex({ mobile: 1 }, { unique: true }),
    leadsCollection("councilors").createIndex({ email: 1 }, { unique: true }),
    leadsCollection("customers").createIndex({ assignedTo: 1, createdAt: -1 }),
    leadsCollection("customers").createIndex({ funnelId: 1, status: 1 }),
    leadActivitiesCollection().createIndex({ createdAt: -1, councilor: 1 }),
  ]).catch((error) => {
    indexesReady = undefined;
    throw error;
  });
  await indexesReady;
}
