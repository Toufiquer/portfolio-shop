export type CouncilorProgressPeriod = {
  from: string;
  to: string;
  followUps: number;
  customersTouched: number;
};

export type CouncilorProgressSnapshot = {
  timeZone: string;
  asOf: string;
  assignedCustomers: number;
  workingCustomers: number;
  periods: {
    daily: CouncilorProgressPeriod;
    weekly: CouncilorProgressPeriod;
    monthly: CouncilorProgressPeriod;
  };
};

export type CouncilorProgressWindows = {
  timeZone: string;
  asOf: Date;
  asOfIso: string;
  daily: { from: Date; to: Date };
  weekly: { from: Date; to: Date };
  monthly: { from: Date; to: Date };
};

export const COUNCILOR_PROGRESS_TIME_ZONE: "Asia/Dhaka";
export function getCouncilorProgressWindows(asOf?: Date, timeZone?: string): CouncilorProgressWindows;
export function buildCouncilorProgressPipeline(
  councilors: { id: string; email: string }[],
  windows: CouncilorProgressWindows,
): Record<string, unknown>[];
export function mapCouncilorProgress(
  councilors: { id: string; email: string }[],
  rows: { _id: string; [key: string]: unknown }[],
  windows: CouncilorProgressWindows,
): { byCouncilorId: Map<string, CouncilorProgressSnapshot>; team: CouncilorProgressSnapshot };
