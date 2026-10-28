/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  sourceName: string;
  featured: boolean;
  popular: boolean;
}

export interface BlogTopic {
  id: string;
  label: string;
}

export interface IVisaInsightsData {
  pageUid: string;
  pageName: string;
  heroEyebrow: string;
  heroEyebrowVisible: boolean;
  heroTitle: string;
  heroDescription: string;
  popularTitle: string;
  newsletterEyebrow: string;
  newsletterEyebrowVisible: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  topics: BlogTopic[];
  blogs: BlogPost[];
  backgroundColor: string;
  surfaceColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
  accentDarkColor: string;
}

export interface VisaInsightsPayload extends IVisaInsightsData {
  paddingX: number;
  paddingY: number;
}

export interface VisaInsightsProps {
  data?: IVisaInsightsData | VisaInsightsPayload | string;
}

export const defaultBlogDraft: Omit<BlogPost, "id" | "publishedAt"> = {
  title: "",
  excerpt: "",
  url: "",
  imageUrl: "",
  imageAlt: "",
  category: "",
  author: "",
  readTime: "",
  sourceName: "",
  featured: false,
  popular: false,
};
export const defaultBlogTopic: Omit<BlogTopic, "id"> = { label: "" };

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export const defaultDataVisaInsights: IVisaInsightsData = {
  pageUid: "visa-insights-uid",
  pageName: "",
  heroEyebrow: "",
  heroEyebrowVisible: false,
  heroTitle: "",
  heroDescription: "",
  popularTitle: "",
  newsletterEyebrow: "",
  newsletterEyebrowVisible: false,
  newsletterTitle: "",
  newsletterDescription: "",
  newsletterButtonText: "",
  ctaTitle: "",
  ctaDescription: "",
  ctaButtonText: "",
  ctaButtonUrl: "",
  topics: [],
  blogs: [],
  backgroundColor: "",
  surfaceColor: "",
  headingColor: "",
  textColor: "",
  accentColor: "",
  accentDarkColor: "",
};
