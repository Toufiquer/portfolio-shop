/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  description: string;
  actionText: string;
}

export interface Section13Data {
  id: string;
  sectionUid: string;
  paddingX: number;
  paddingY: number;
  title: string;
  badge: string;
  showEyebrow: boolean;
  subTitle: string;
  description: string;
  categories: string[];
  events: IEvent[];
}

export interface Section13Props {
  data?: Section13Data | string;
}

export const defaultEvent: Omit<IEvent, "id" | "category"> = {
  title: "",
  date: "",
  location: "",
  image: "",
  description: "",
  actionText: "",
};

export const defaultDataSection13: Section13Data = {
  sectionUid: "section-uid-13",
  id: "section-uid-13",
  paddingX: 0,
  paddingY: 0,
  title: "NexaMart",
  badge: "NexaMart · NxMart",
  showEyebrow: true,
  subTitle: "Online shopping",
  description: "Browse available products on NexaMart.",
  categories: [],
  events: [],
};
