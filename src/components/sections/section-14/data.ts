/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type ArticleBlock =
  | { type: "text"; content: string }
  | { type: "quote"; content: string; author: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "heading"; content: string };

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Section14Data {
  id: string;
  sectionUid: string;
  paddingX: number;
  paddingY: number;
  badge: string;
  showEyebrow: boolean;
  title: string;
  subTitle: string;
  allData: {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    readTime: string;
    publishedAt: string;
    author: Author;
    heroImage: string;
    content: ArticleBlock[];
    tags: string[];
  }[];
}

const defaultDataSection14Items: Section14Data[] = [
  {
    id: "section-uid-14",
    sectionUid: "section-uid-14",
    paddingX: 0,
    paddingY: 0,
    badge: "NexaMart · NxMart",
    showEyebrow: true,
    title: "Online shopping",
    subTitle: "Browse products available on NexaMart.",
    allData: [],
  },
];

export const defaultDataSection14 = defaultDataSection14Items[0];
