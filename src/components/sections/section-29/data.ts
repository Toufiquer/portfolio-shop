/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section29Data {
  id: string;
  title: string;
  subtitle: string;
  buttonPrimaryText: string;
  buttonSecondaryText: string;
  contactLabel: string;
  contactNumber: string;
}

export interface Section29Payload extends Section29Data {
  paddingX: number;
  paddingY: number;
}

export interface Section29Props {
  data?: Section29Data | Section29Payload | string;
}

export const defaultDataSection29: Section29Data = {
  id: "section-uid-29",
  title: "Questions about shopping with NexaMart?",
  subtitle: "Contact NexaMart by phone or WhatsApp.",
  buttonPrimaryText: "Browse products",
  buttonSecondaryText: "Contact us",
  contactLabel: "Call NexaMart",
  contactNumber: "01711111111",
};

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};
