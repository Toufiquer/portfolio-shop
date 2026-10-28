/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IPartner {
  id: string;
  name: string;
  logo: string;
}

export interface ICollabOption {
  id: string;
  title: string;
  description: string;
}

export interface Section12Data {
  id: string;
  sectionUid: string;
  paddingX: number;
  paddingY: number;
  title: string;
  badge: string;
  showEyebrow: boolean;
  subTitle: string;
  description: string;
  partners: IPartner[];
  collabOptions: ICollabOption[];
}

export interface Section12Props {
  data?: Section12Data | string;
}

export const defaultPartner: Omit<IPartner, "id"> = { name: "", logo: "" };
export const defaultCollabOption: Omit<ICollabOption, "id"> = { title: "", description: "" };

export const defaultDataSection12: Section12Data = {
  id: "section-uid-12",
  sectionUid: "section-uid-12",
  paddingX: 0,
  paddingY: 0,
  badge: "NexaMart · NxMart",
  showEyebrow: true,
  title: "Online shopping",
  subTitle: "Across Bangladesh",
  description: "NexaMart is an online shopping platform in Bangladesh.",
  partners: [],
  collabOptions: [],
};
