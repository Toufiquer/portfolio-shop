/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IServiceFeature {
  title: string;
  description: string;
  iconName: string;
}

export interface Section30Data {
  id: string;
  badgeText: string;
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix: string;
  features: IServiceFeature[];
  ctaText: string;
  rightCardBadge: string;
  locationLabel: string;
  destinationLabel: string;
}

export interface Section30Payload extends Section30Data {
  paddingX: number;
  paddingY: number;
}

export interface Section30Props {
  data?: Section30Data | Section30Payload | string;
}

export const defaultDataSection30: Section30Data = {
  id: "section-uid-30",
  badgeText: "NexaMart · NxMart",
  headingPrefix: "Online",
  headingHighlight: "shopping",
  headingSuffix: "across Bangladesh",
  features: [],
  ctaText: "Browse products",
  rightCardBadge: "Shop online",
  locationLabel: "Service area",
  destinationLabel: "Bangladesh",
};

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
