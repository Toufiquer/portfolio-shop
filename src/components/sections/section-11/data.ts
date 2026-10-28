/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IMilestone {
  label: string;
  value: string;
}

export interface IExperienceItem {
  id: string;
  year: string;
  companyName: string;
  role: string;
  description: string;
  lastAchievement: string;
  highlightMilestone: IMilestone;
  features: string[];
}

export interface Section11Data {
  id: string;
  sectionUid: string;
  paddingX: number;
  paddingY: number;
  eyebrow: string;
  showEyebrow: boolean;
  title: string;
  subTitle: string;
  description: string;
  experiences: IExperienceItem[];
}

export interface Section11Props {
  data?: Section11Data | string;
}

export const defaultExperience: Omit<IExperienceItem, "id"> = {
  year: "",
  companyName: "",
  role: "",
  description: "",
  lastAchievement: "",
  highlightMilestone: { label: "", value: "" },
  features: [],
};

export const defaultDataSection11: Section11Data = {
  sectionUid: "section-uid-11",
  id: "section-uid-11",
  paddingX: 0,
  paddingY: 0,
  eyebrow: "NexaMart · NxMart",
  showEyebrow: true,
  title: "NexaMart",
  subTitle: "Online shopping",
  description: "NexaMart serves customers across Bangladesh.",
  experiences: [],
};
