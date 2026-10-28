/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section44Requirement {
  id: string;
  title: string;
  description: string;
}

export interface ISection44Data {
  id: string;
  title: string;
  introduction: string;
  requirements: Section44Requirement[];
  imageUrl: string;
  imageAlt: string;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
}

export type Section44Data = ISection44Data;

export interface Section44Payload extends Section44Data {
  paddingX: number;
  paddingY: number;
}

export interface Section44Props {
  data?: Section44Data | Section44Payload | string;
}

export const defaultDataSection44: Section44Data = {
  id: "section-uid-44",
  title: "Product information",
  introduction: "Review the information shown with each product before placing an order.",
  requirements: [],
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart logo",
  backgroundColor: "#f8f9fb",
  headingColor: "#24349a",
  textColor: "#202641",
  accentColor: "#ef0b5b",
};

export const defaultData = defaultDataSection44;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
