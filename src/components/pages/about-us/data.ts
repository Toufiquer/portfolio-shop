/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type AboutSection = {
  id: string;
  eyebrow: string;
  showEyebrow: boolean;
  title: string;
  description: string;
};

export const defaultSections: AboutSection[] = [
  {
    id: "believe",
    eyebrow: "What we believe",
    showEyebrow: true,
    title: "Useful work starts with clear thinking.",
    description: "NexaMart is an online shopping platform serving customers across Bangladesh.",
  },
  {
    id: "work",
    eyebrow: "How we work",
    showEyebrow: true,
    title: "We make complex work feel simple.",
    description: "NexaMart helps customers browse available products online.",
  },
  {
    id: "people",
    eyebrow: "The people behind it",
    showEyebrow: true,
    title: "A collaborative team brings ideas to life.",
    description: "NexaMart is also known as NxMart.",
  },
  {
    id: "next",
    eyebrow: "What comes next",
    showEyebrow: true,
    title: "Strong work keeps improving after launch.",
    description: "For questions, contact NexaMart by phone, WhatsApp, or email.",
  },
];

export const defaultAboutSection: Omit<AboutSection, "id"> = {
  eyebrow: "New eyebrow",
  showEyebrow: true,
  title: "New section",
  description: "Add your section description.",
};

// Structured content remains serialized for compatibility with the existing page API.
export const defaultData = {
  eyebrow: "About us",
  showEyebrow: "true",
  title: "About NexaMart",
  intro: "NexaMart (NxMart) is an online shopping platform serving customers across Bangladesh.",
  image: "/Logo.png",
  sectionsJson: JSON.stringify(defaultSections),
  paddingX: "0",
  paddingY: "0",
};
