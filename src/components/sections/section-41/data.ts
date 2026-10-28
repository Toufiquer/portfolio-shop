/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ISection41Data {
  id: string;
  title: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
}

export type Section41Data = ISection41Data;

export interface Section41Payload extends Section41Data {
  paddingX: number;
  paddingY: number;
}

export interface Section41Props {
  data?: Section41Data | Section41Payload | string;
}

export const defaultDataSection41: Section41Data = {
  id: "section-uid-41",
  title: "Online shopping across Bangladesh",
  paragraphs: ["NexaMart (NxMart) is an online shopping platform in Bangladesh.", "Browse available products online."],
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart logo",
  backgroundColor: "#f6f7f9",
  headingColor: "#252d8f",
  textColor: "#202641",
};

export const defaultData = defaultDataSection41;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
