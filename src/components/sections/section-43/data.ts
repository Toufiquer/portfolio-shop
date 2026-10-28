/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section43Benefit {
  id: string;
  title: string;
  description: string;
}

export interface ISection43Data {
  id: string;
  title: string;
  introduction: string;
  benefits: Section43Benefit[];
  imageUrl: string;
  imageAlt: string;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
}

export type Section43Data = ISection43Data;

export interface Section43Payload extends Section43Data {
  paddingX: number;
  paddingY: number;
}

export interface Section43Props {
  data?: Section43Data | Section43Payload | string;
}

export const defaultDataSection43: Section43Data = {
  id: "section-uid-43",
  title: "Browse products",
  introduction: "Explore the products currently available on NexaMart.",
  benefits: [],
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart logo",
  backgroundColor: "#f8f9fb",
  headingColor: "#24349a",
  textColor: "#202641",
  accentColor: "#ef0b5b",
};

export const defaultData = defaultDataSection43;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
