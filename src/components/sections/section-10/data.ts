/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IStory {
  id: string;
  name: string;
  image: string;
  university: string;
  showEyebrow: boolean;
  subject: string;
  description: string;
}

export interface Section10Data {
  id: string;
  sectionUid: string;
  paddingX: number;
  paddingY: number;
  stories: IStory[];
  storiesPerPage: number;
}

export interface Section10Props {
  data?: Section10Data | string;
}

export const defaultStory: Omit<IStory, "id"> = {
  name: "",
  university: "",
  subject: "",
  image: "",
  showEyebrow: false,
  description: "",
};

export const defaultDataSection10: Section10Data = {
  sectionUid: "section-uid-10",
  id: "section-uid-10",
  paddingX: 0,
  paddingY: 0,
  storiesPerPage: 1,
  stories: [],
};
