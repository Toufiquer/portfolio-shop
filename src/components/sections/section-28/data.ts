/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IFeatureItem {
  title: string;
  description: string;
  iconName: string;
  gradient: string;
}

export interface Section28Data {
  id: string;
  title: string;
  subtitle: string;
  features: IFeatureItem[];
}

export interface Section28Payload extends Section28Data {
  paddingX: number;
  paddingY: number;
}

export interface Section28Props {
  data?: Section28Data | Section28Payload | string;
}

export const defaultDataSection28: Section28Data = {
  id: "section-uid-28",
  title: "Explore NexaMart",
  subtitle: "Online shopping across Bangladesh.",
  features: [],
};

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
