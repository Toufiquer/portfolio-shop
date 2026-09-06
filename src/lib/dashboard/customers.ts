/*
|-----------------------------------------
| setting up customers.ts for the App
| @author: Codex
|-----------------------------------------
*/

export const customerStatuses = ["lead", "active", "inactive", "archived"] as const;
export type CustomerStatus = (typeof customerStatuses)[number];
export type FunnelStage = { id: string; name: string };
export type CustomerFunnel = {
  id: string;
  name: string;
  description: string;
  minimumAmount: number;
  maximumAmount: number | null;
  stages: FunnelStage[];
  createdAt: string;
  updatedAt: string;
};
export type CustomerMetrics = {
  amountSpent: number;
  purchaseCount: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  haveWithUs: string;
};
export type Customer = {
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
  createdAt: string;
  updatedAt: string;
  metrics: CustomerMetrics;
};
/*
|-----------------------------------------
| customer dashboard types
|-----------------------------------------
*/
