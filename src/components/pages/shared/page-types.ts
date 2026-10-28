/*
|-----------------------------------------
| setting up page-type.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type PageTemplateSection = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export type PageTemplateData = {
  pageUid: string;
  pageName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryAction: string;
  secondaryAction: string;
  highlightTitle?: string;
  highlightDescription?: string;
  sections: PageTemplateSection[];
};

export type PageTemplateProps<T extends PageTemplateData> = { data?: T | string };
