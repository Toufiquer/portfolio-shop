/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ISection42Data {
  id: string;
  title: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
}

export type Section42Data = ISection42Data;

export interface Section42Payload extends Section42Data {
  paddingX: number;
  paddingY: number;
}

export interface Section42Props {
  data?: Section42Data | Section42Payload | string;
}

export const defaultDataSection42: Section42Data = {
  id: "section-uid-42",
  title: "Shop online with NexaMart",
  paragraphs: ["NexaMart (NxMart) is an online shopping platform serving customers across Bangladesh."],
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart logo",
  backgroundColor: "#f6f7f9",
  headingColor: "#252d8f",
  textColor: "#202641",
};

export const defaultData = defaultDataSection42;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
