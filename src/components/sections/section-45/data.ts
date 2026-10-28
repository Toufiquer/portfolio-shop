/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section45Document {
  id: string;
  text: string;
}

export interface ISection45Data {
  id: string;
  title: string;
  introduction: string;
  documents: Section45Document[];
  imageUrl: string;
  imageAlt: string;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
}

export type Section45Data = ISection45Data;

export interface Section45Payload extends Section45Data {
  paddingX: number;
  paddingY: number;
}

export interface Section45Props {
  data?: Section45Data | Section45Payload | string;
}

export const defaultDataSection45: Section45Data = {
  id: "section-uid-45",
  title: "Product details",
  introduction: "See each product listing for its available details.",
  documents: [],
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart logo",
  backgroundColor: "#f8f9fb",
  headingColor: "#24349a",
  textColor: "#202641",
  accentColor: "#ef0b5b",
};

export const defaultData = defaultDataSection45;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
