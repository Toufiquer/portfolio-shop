/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ISection39Data {
  id: string;
  titlePrefix: string;
  highlightedTitle: string;
  titleSuffix: string;
  paragraphs: string[];
  primaryImage: string;
  topImage: string;
  bottomImage: string;
  backgroundColor: string;
  headingColor: string;
  accentColor: string;
  textColor: string;
}

export type Section39Data = ISection39Data;

export interface Section39Payload extends Section39Data {
  paddingX: number;
  paddingY: number;
}

export interface Section39Props {
  data?: Section39Data | Section39Payload | string;
}

export const defaultDataSection39: Section39Data = {
  id: "section-uid-39",
  titlePrefix: "Shop online with",
  highlightedTitle: "NexaMart",
  titleSuffix: "across Bangladesh",
  paragraphs: [
    "NexaMart is an online shopping platform in Bangladesh.",
    "Browse the products available on NexaMart and contact us if you have a question.",
    "NexaMart serves customers across Bangladesh.",
  ],
  primaryImage: "/Logo.png",
  topImage: "/Logo.png",
  bottomImage: "/Logo.png",
  backgroundColor: "#ffffff",
  headingColor: "#050505",
  accentColor: "#2477f2",
  textColor: "#5f6780",
};

export const defaultData = defaultDataSection39;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
