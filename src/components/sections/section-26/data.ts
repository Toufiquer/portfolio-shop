/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface IStatItem {
  value: string;
  label: string;
  iconName: string;
}

export interface Section26Data {
  id: string;
  title: string;
  buttonText: string;
  stats: IStatItem[];
}

export interface Section26Props {
  data?: Section26Data | Section26Payload | string;
}

export const defaultDataSection26: Section26Data = {
  id: "section-uid-26",
  title: "Shop online with NexaMart",
  buttonText: "Browse products",
  stats: [],
};

export interface Section26Payload extends Section26Data {
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };
