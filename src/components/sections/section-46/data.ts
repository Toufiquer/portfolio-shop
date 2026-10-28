/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section46Institution {
  id: string;
  name: string;
  level: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonUrl: string;
}

export interface ISection46Data {
  id: string;
  eyebrow: string;
  showEyebrow?: boolean;
  title: string;
  description: string;
  institutions: Section46Institution[];
  backgroundColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
  cardColor: string;
  badgeColor: string;
}

export type Section46Data = ISection46Data;

export interface Section46Payload extends Section46Data {
  paddingX: number;
  paddingY: number;
}

export interface Section46Props {
  data?: Section46Data | Section46Payload | string;
}

export const defaultDataSection46: Section46Data = {
  id: "section-uid-46",
  showEyebrow: true,
  eyebrow: "NEXAMART · NXMART",
  title: "Products",
  description: "Browse the products currently available on NexaMart.",
  institutions: [],
  backgroundColor: "#ffffff",
  headingColor: "#29399b",
  textColor: "#252b47",
  accentColor: "#ed075a",
  cardColor: "#ffffff",
  badgeColor: "#ffffff",
};

export const defaultData = defaultDataSection46;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
