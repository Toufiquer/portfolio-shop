/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type HomeCard = {
  title: string;
  description: string;
};

export type HomeData = {
  forceUpdate: "true" | "false";
  paddingX: number;
  paddingY: number;
  eyebrow: string;
  title: string;
  intro: string;
  imageUrl: string;
  imageAlt: string;
  sectionsJson: string;
};

export const defaultCards: HomeCard[] = [];

export const defaultHomeCard: HomeCard = { title: "New section", description: "Add a short description." };

export const defaultData: HomeData = {
  forceUpdate: "false",
  paddingX: 0,
  paddingY: 0,
  eyebrow: "NexaMart · NxMart",
  title: "Online shopping across Bangladesh",
  intro: "Browse available products and shop online with NexaMart.",
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart logo",
  sectionsJson: JSON.stringify(defaultCards),
};
