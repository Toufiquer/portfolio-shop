/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section9Data {
  id: string;
  paddingX: number;
  paddingY: number;
  eyebrow: string;
  showEyebrow: boolean;
  title: string;
  subTitle: string;
  description: string;
  sectionUid: string;
}

export interface Section9Props {
  data?: Section9Data | string;
}

export const defaultDataSection9: Section9Data = {
  sectionUid: "section-uid-9",
  id: "section-uid-9",
  paddingX: 0,
  paddingY: 0,
  eyebrow: "NexaMart · NxMart",
  showEyebrow: true,
  title: "Online shopping",
  subTitle: "Across Bangladesh",
  description: "Browse available products on NexaMart.",
};
