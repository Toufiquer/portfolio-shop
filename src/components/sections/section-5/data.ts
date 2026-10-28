/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Author {
  name: string;
  avatar: string;
  role: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  readTime: string;
  author: Author;
  category: string;
  tags: string[];
  featured?: boolean;
}
export interface Section5Data {
  id: string;
  paddingX: number;
  paddingY: number;
  showEyebrow?: boolean;
  categories: string[];
  allData: BlogPost[];
}
export const defaultDataSection5: Section5Data = {
  id: "section-uid-5",
  paddingX: 0,
  paddingY: 0,
  showEyebrow: true,
  categories: [],
  allData: [],
};
