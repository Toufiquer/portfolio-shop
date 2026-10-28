/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ISection47Data {
  id: string;
  title: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
}

export type Section47Data = ISection47Data;

export interface Section47Payload extends Section47Data {
  paddingX: number;
  paddingY: number;
}

export interface Section47Props {
  data?: Section47Data | Section47Payload | string;
}

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataSection47: Section47Data = {
  id: "section-uid-47",
  title: "NexaMart · NxMart",
  paragraphs: ["Online shopping across Bangladesh. Browse available products on NexaMart."],
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart logo",
  backgroundColor: "#f6f7f9",
  headingColor: "#252d8f",
  textColor: "#202641",
};

export const defaultData = defaultDataSection47;
