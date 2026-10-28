/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import type { PageTemplateData, PageTemplateProps, PageTemplateSection } from "../shared/page-types";

export type PrivacySection = PageTemplateSection & { id?: string; showEyebrow: boolean };
export type ISection4Data = Omit<PageTemplateData, "sections"> & {
  showEyebrow: boolean;
  image: string;
  paddingX: number;
  paddingY: number;
  sections: PrivacySection[];
};
export type Section4Props = PageTemplateProps<ISection4Data>;

export const defaultDataPage4: ISection4Data = {
  pageUid: "page-uid-privacy-policy",
  pageName: "Privacy Policy",
  eyebrow: "",
  showEyebrow: false,
  image: "/Logo.png",
  paddingX: 0,
  paddingY: 0,
  title: "Privacy Policy",
  subtitle: "",
  primaryAction: "",
  secondaryAction: "",
  highlightTitle: "",
  highlightDescription: "",
  sections: [],
};
