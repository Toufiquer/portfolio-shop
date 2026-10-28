/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import type { PageTemplateData } from "../shared/page-types";

export type ISiteTermsAndConditionsData = PageTemplateData;

export interface SiteTermsAndConditionsPayload extends ISiteTermsAndConditionsData {
  paddingX: number;
  paddingY: number;
}

export type SiteTermsAndConditionsProps = {
  data?: ISiteTermsAndConditionsData | SiteTermsAndConditionsPayload | string;
};

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataSiteTermsAndConditions: ISiteTermsAndConditionsData = {
  pageUid: "site-terms-and-conditions-uid",
  pageName: "Terms and Conditions",
  eyebrow: "Terms & Conditions",
  title: "Terms and Conditions",
  subtitle: "",
  primaryAction: "",
  secondaryAction: "",
  sections: [],
};
