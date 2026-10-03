import type {
  BusinessGrowthAccessArea,
  BusinessGrowthRequestTarget,
  DashboardOperation,
} from "./dashboard-authorization";

export type BusinessGrowthPolicyState = {
  bypassed: boolean;
  blocked: boolean;
  roleName: string | null;
  sidebarPermissions?: { url: string; permissions: Partial<Record<DashboardOperation, boolean>> }[];
  message?: string;
};

export type BusinessGrowthPolicyDecision<TState> = { allowed: boolean; state: TState };

export function isBusinessGrowthAdministratorRole(roleName: string | null): boolean;
export function isBusinessGrowthCouncilorRole(roleName: string | null): boolean;
export type CouncilorCustomerPatch = {
  customerStatus?: "active" | "inactive";
  notes?: string;
  followUps?: unknown[];
};
export type CouncilorCustomerPatchDecision =
  { allowed: true; patch: CouncilorCustomerPatch } | { allowed: false; status: 400 | 403; error: string };
export function authorizeCouncilorCustomerPatch(value: unknown): CouncilorCustomerPatchDecision;
export function authorizeBusinessGrowthPolicy<TState extends BusinessGrowthPolicyState>(
  state: TState,
  area: string,
  method: string,
  target: string,
  authorizeDashboard: (
    state: TState,
    pathname: string,
    method: string,
  ) => Promise<BusinessGrowthPolicyDecision<TState>>,
): Promise<BusinessGrowthPolicyDecision<TState>>;
export function guardBusinessGrowthApiRequest<TSession>(
  request: Request,
  input: {
    area: BusinessGrowthAccessArea;
    method: string;
    target?: BusinessGrowthRequestTarget;
    getSession: (headers: Headers) => Promise<TSession | null>;
    authorize: (
      session: TSession,
      area: BusinessGrowthAccessArea,
      method: string,
      target: BusinessGrowthRequestTarget,
    ) => Promise<{ allowed: boolean; state?: { message?: string } }>;
  },
): Promise<Response | null>;
export function normalizeBusinessGrowthReadKind(
  value: unknown,
): "workspace" | "overview" | "customers" | "tasks" | "funnels" | "councilors" | "spends" | null;
export function normalizeBusinessGrowthPostKind(
  value: unknown,
): "customer" | "councilor" | "funnel" | "spend" | "demo-spends" | null;
export function normalizeBusinessGrowthItemKind(
  value: unknown,
): "customer" | "councilor" | "funnel" | "spend" | "task" | null;
export function normalizeBusinessGrowthBulkPatchKind(value: unknown): "customers" | null;
export function normalizeBusinessGrowthBulkDeleteKind(value: unknown): "customers" | "funnels" | "spends" | null;
export function normalizeBusinessGrowthBulkPostKind(value: unknown): "customers" | "demo-with-orders" | null;
