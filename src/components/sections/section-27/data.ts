/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ICourseCard {
  title: string;
  level: string;
  levelColorClass: string;
  description: string;
  features: string[];
  duration: string;
  classes: string;
  price?: string;
  popular?: boolean;
  schedule?: string[];
}

export interface Section27Data {
  id: string;
  badgeText: string;
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix: string;
  subTitle: string;
  tab1Label: string;
  tab2Label: string;
  courses: ICourseCard[];
}

export interface Section27Payload extends Section27Data {
  paddingX: number;
  paddingY: number;
}

export interface Section27Props {
  data?: Section27Data | Section27Payload | string;
}

export const defaultDataSection27: Section27Data = {
  id: "section-uid-27",
  badgeText: "NexaMart · NxMart",
  headingPrefix: "Browse",
  headingHighlight: "available",
  headingSuffix: "products",
  subTitle: "Online shopping across Bangladesh",
  tab1Label: "Products",
  tab2Label: "Shop",
  courses: [],
};

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
