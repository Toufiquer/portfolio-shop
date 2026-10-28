/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import type { PageTemplateData } from "../shared/page-types";

export type IAboutTheCountryData = PageTemplateData;

export interface AboutTheCountryPayload extends IAboutTheCountryData {
  paddingX: number;
  paddingY: number;
}

export type AboutTheCountryProps = { data?: IAboutTheCountryData | AboutTheCountryPayload | string };

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataAboutTheCountry: IAboutTheCountryData = {
  pageUid: "about-the-country-uid",
  pageName: "NexaMart",
  eyebrow: "NexaMart · NxMart",
  title: "Online shopping across Bangladesh",
  subtitle: "Browse available products on NexaMart.",
  primaryAction: "Browse products",
  secondaryAction: "Contact us",
  sections: [],
};
