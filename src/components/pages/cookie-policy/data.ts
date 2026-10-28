/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface CookiePolicySection {
  title: string;
  description?: string;
  items?: string[];
}

export interface ICookiePolicyData {
  pageUid: string;
  pageName: string;
  title: string;
  lastUpdatedLabel: string;
  sections: CookiePolicySection[];
  contactTitle: string;
  contactDescription: string;
  supportEmail: string;
}

export interface CookiePolicyPayload extends ICookiePolicyData {
  paddingX: number;
  paddingY: number;
}

export interface CookiePolicyProps {
  data?: ICookiePolicyData | CookiePolicyPayload | string;
}

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataCookiePolicy: ICookiePolicyData = {
  pageUid: "cookie-policy-uid",
  pageName: "Cookie Policy",
  title: "Cookie Policy",
  lastUpdatedLabel: "",
  sections: [],
  contactTitle: "Contact NexaMart",
  contactDescription: "For questions, contact us by phone, WhatsApp, or email.",
  supportEmail: "example@gmail.com",
};

export const defaultCookiePolicySection: CookiePolicySection = {
  title: "New Cookie Policy Section",
  description: "Write the cookie policy details for this section.",
  items: [],
};
