/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend: number;
  status: "stable" | "warning" | "critical";
}

export interface ModerationItem {
  id: string;
  type: "comment" | "article";
  content: string;
  author: {
    name: string;
    avatar: string;
    trustScore: number;
  };
  flagReason: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

export const defaultDataSection4 = {
  id: "section-uid-4",
  paddingX: 0,
  paddingY: 0,
  showEyebrow: true,
  badge: "NexaMart · NxMart",
  title: "Online shopping",
  subTitle: "Across Bangladesh",
  metrics: [] as DashboardMetric[],
  moderationQueue: [] as ModerationItem[],
};

export type Section4Data = typeof defaultDataSection4;
