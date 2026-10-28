/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ISection40Data {
  id: string;
  eyebrow: string;
  showEyebrow: boolean;
  title: string;
  highlightedTitle: string;
  paragraphs: string[];
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  onlineAppointmentImage: string;
  physicalAppointmentImage: string;
  backgroundColor: string;
  headingColor: string;
  accentColor: string;
  textColor: string;
  buttonColor: string;
}

export type Section40Data = ISection40Data;

export interface Section40Payload extends Section40Data {
  paddingX: number;
  paddingY: number;
}

export interface Section40Props {
  data?: Section40Data | Section40Payload | string;
}

export const defaultDataSection40: Section40Data = {
  id: "section-uid-40",
  eyebrow: "NexaMart · NxMart",
  showEyebrow: true,
  title: "Get Your",
  highlightedTitle: "Contact NexaMart",
  paragraphs: [
    "NexaMart is an online shopping platform serving customers across Bangladesh.",
    "For questions, contact NexaMart by phone, WhatsApp, or email.",
    "Browse available products online.",
  ],
  primaryButtonText: "Browse products",
  primaryButtonUrl: "/products",
  secondaryButtonText: "Contact us",
  secondaryButtonUrl: "/contact-us",
  onlineAppointmentImage: "/Logo.png",
  physicalAppointmentImage: "/Logo.png",
  backgroundColor: "#ffffff",
  headingColor: "#050505",
  accentColor: "#2477f2",
  textColor: "#5f6780",
  buttonColor: "#2477f2",
};

export const defaultData = defaultDataSection40;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
