/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import type { PageTemplateData, PageTemplateProps, PageTemplateSection } from "../shared/page-types";

export type TermsSection = PageTemplateSection & { id?: string; showEyebrow: boolean };
export type ISection5Data = Omit<PageTemplateData, "sections"> & {
  showEyebrow: boolean;
  image: string;
  paddingX: number;
  paddingY: number;
  sections: TermsSection[];
};
export type Section5Props = PageTemplateProps<ISection5Data>;

export const defaultTermsSection: TermsSection = {
  id: "",
  eyebrow: "New section",
  showEyebrow: true,
  title: "New terms section",
  description: "Add the terms for this section.",
  items: ["Add a key point"],
};

export const defaultDataPage5: ISection5Data = {
  pageUid: "page-uid-terms-and-conditions",
  pageName: "Terms and Conditions",
  eyebrow: "",
  showEyebrow: false,
  image: "/Logo.png",
  paddingX: 0,
  paddingY: 0,
  title: "Terms and Conditions",
  subtitle: "",
  primaryAction: "",
  secondaryAction: "",
  highlightTitle: "",
  highlightDescription: "",
  sections: [],
};
