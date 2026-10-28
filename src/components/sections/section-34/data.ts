/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface VideoReview {
  id: number;
  label: string;
  sub: string;
  backgroundColor: string;
  link: string;
}

export interface ISection34Data {
  id: string;
  pageUid: string;
  pageName: string;
  badgeText: string;
  title: string;
  subtitle: string;
  videos: VideoReview[];
}

export interface Section34Payload extends ISection34Data {
  paddingX: number;
  paddingY: number;
}

export type Section34Data = ISection34Data;

export interface Section34Props {
  data?: ISection34Data | Section34Payload | string;
}

export const defaultDataSection34: ISection34Data = {
  id: "section-uid-34",
  pageUid: "section-uid-34",
  pageName: "Section 34",
  badgeText: "NexaMart · NxMart",
  title: "Product videos",
  subtitle: "",
  videos: [],
};

export const defaultData = defaultDataSection34;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export { getYouTubeEmbedUrl } from "@/lib/youtube";
