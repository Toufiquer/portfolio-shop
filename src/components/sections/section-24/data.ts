/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IFeatureItem {
  title: string;
  subtitle: string;
  iconName: string;
  iconColorClass: string;
  bgColorClass: string;
}

export interface IStatItem {
  value: string;
  label: string;
  colorClass: string;
}

export interface ISection24Data {
  sectionUid: string;
  features: IFeatureItem[];
  stats: IStatItem[];
  ctaText: string;
  ctaLink: string;
}

export interface Section24Props {
  data?: ISection24Data | Section24Payload | string;
}

export const defaultDataSection24: ISection24Data = {
  sectionUid: "section-uid-24",
  features: [],
  stats: [],
  ctaText: "Browse products",
  ctaLink: "/products",
};

export const defaultData = defaultDataSection24;

export interface Section24Payload extends ISection24Data {
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };
