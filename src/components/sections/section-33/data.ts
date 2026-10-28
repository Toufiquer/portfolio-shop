/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface HeroStat {
  id: number;
  value: string;
  label: string;
}

export interface HeroFeature {
  id: number;
  icon: string;
  label: string;
}

export interface ISection33Data {
  id: string;
  pageUid: string;
  pageName: string;
  badgeText: string;
  showEyebrow: boolean;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  stats: HeroStat[];
  features: HeroFeature[];
}

export type Section33Data = ISection33Data;

export interface Section33Payload extends Section33Data {
  paddingX: number;
  paddingY: number;
}

export interface Section33Props {
  data?: Section33Data | Section33Payload | string;
}

export const defaultDataSection33: Section33Data = {
  id: "section-uid-33",
  pageUid: "section-uid-33",
  pageName: "Section 33",
  badgeText: "NexaMart · NxMart",
  showEyebrow: true,
  titleLine1: "Online shopping",
  titleLine2: "across Bangladesh",
  subtitle: "Browse available products on NexaMart.",
  stats: [],
  features: [],
};

export const defaultData = defaultDataSection33;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
