/*
|-----------------------------------------
| setting up customers.ts for the App
| @author: Codex
|-----------------------------------------
*/

export const customerStatuses = ["active", "inactive"] as const;
export type CustomerStatus = (typeof customerStatuses)[number];
export type FunnelStage = { id: string; name: string };
export type CustomerFunnel = {
  id: string;
  position: number;
  color: string;
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
export type CustomerSpend = {
  id: string;
  funnelId: string;
  amount: number;
  createdAt: string;
};
export type CustomerFollowUp = {
  id: string;
  note: string;
  createdAt: string;
  authorEmail: string;
  authorName: string;
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
  followUps: CustomerFollowUp[];
  councilorId?: string | null;
  councilorEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  metrics: CustomerMetrics;
};
export type Councilor = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  assignedCount: number;
  activeCount: number;
  inactiveCount: number;
  counsellingLast24Hours: number;
  createdAt: string;
};
/*
|-----------------------------------------
| customer dashboard types
|-----------------------------------------
*/
