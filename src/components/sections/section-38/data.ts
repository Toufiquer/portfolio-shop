/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ISection38Data {
  id: string;
  missionEyebrow: string;
  showMissionEyebrow: boolean;
  missionTitle: string;
  missionHighlightedTitle: string;
  missionDescription: string;
  visionEyebrow: string;
  showVisionEyebrow: boolean;
  visionTitle: string;
  visionHighlightedTitle: string;
  visionDescription: string;
  missionPrimaryImage: string;
  missionTopImage: string;
  missionBottomImage: string;
  visionPrimaryImage: string;
  visionTopImage: string;
  visionBottomImage: string;
  backgroundColor: string;
  headingColor: string;
  accentColor: string;
  textColor: string;
}

export type Section38Data = ISection38Data;

export interface Section38Payload extends Section38Data {
  paddingX: number;
  paddingY: number;
}

export interface Section38Props {
  data?: Section38Data | Section38Payload | string;
}

export const defaultDataSection38: Section38Data = {
  id: "section-uid-38",
  missionEyebrow: "NexaMart",
  showMissionEyebrow: true,
  missionTitle: "Our",
  missionHighlightedTitle: "Mission",
  missionDescription: "NexaMart is an online shopping platform serving customers across Bangladesh.",
  visionEyebrow: "NexaMart",
  showVisionEyebrow: true,
  visionTitle: "Our",
  visionHighlightedTitle: "Vision",
  visionDescription: "NexaMart provides an online place to browse available products and shop.",
  missionPrimaryImage: "/Logo.png",
  missionTopImage: "/Logo.png",
  missionBottomImage: "/Logo.png",
  visionPrimaryImage: "/Logo.png",
  visionTopImage: "/Logo.png",
  visionBottomImage: "/Logo.png",
  backgroundColor: "#ffffff",
  headingColor: "#050505",
  accentColor: "#2477f2",
  textColor: "#5f6780",
};

export const defaultData = defaultDataSection38;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
