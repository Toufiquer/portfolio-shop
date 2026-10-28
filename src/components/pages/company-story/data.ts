/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import type { PageTemplateData, PageTemplateSection } from "../shared/page-types";

export interface CompanyStorySection extends PageTemplateSection {
  showEyebrow?: boolean;
}

export interface ICompanyStoryData extends Omit<PageTemplateData, "sections"> {
  /** Missing flags remain visible so older saved pages stay backward compatible. */
  showEyebrow?: boolean;
  sections: CompanyStorySection[];
}

export interface CompanyStoryPayload extends ICompanyStoryData {
  paddingX: number;
  paddingY: number;
}

export type CompanyStoryProps = { data?: ICompanyStoryData | CompanyStoryPayload | string };

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataCompanyStory: ICompanyStoryData = {
  pageUid: "company-story-uid",
  pageName: "NexaMart Story",
  eyebrow: "NexaMart · NxMart",
  showEyebrow: true,
  title: "NexaMart is an online shopping platform in Bangladesh.",
  subtitle: "NexaMart serves customers across Bangladesh.",
  primaryAction: "Browse products",
  secondaryAction: "Contact us",
  sections: [],
};
