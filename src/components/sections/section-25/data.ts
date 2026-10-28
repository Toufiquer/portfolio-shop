/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IFeatureCard {
  title: string;
  description: string;
  iconName: string;
  gradient: string;
}

export interface Section25Data {
  id: string;
  cards: IFeatureCard[];
}

export interface Section25Props {
  data?: Section25Data | Section25Payload | string;
}

export const defaultDataSection25: Section25Data = {
  id: "section-uid-25",
  cards: [],
};

export interface Section25Payload extends Section25Data {
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };
