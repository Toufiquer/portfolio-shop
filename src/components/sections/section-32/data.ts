/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IStoryItem {
  id: string;
  name: string;
  university: string;
  subject: string;
  image: string;
  description: string;
}

export interface ISection32Data {
  id: string;
  title: string;
  subtitle: string;
  stories: IStoryItem[];
}

export type Section32Data = ISection32Data;

export interface Section32Payload extends Section32Data {
  paddingX: number;
  paddingY: number;
}

export interface Section32Props {
  data?: Section32Data | Section32Payload | string;
}

export const defaultDataSection32: Section32Data = {
  id: "section-uid-32",
  title: "NexaMart",
  subtitle: "Online shopping across Bangladesh",
  stories: [],
};

export const defaultData = defaultDataSection32;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
