/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface WhatsAppFaqItem {
  question: string;
  answer: string;
}

export interface IWhatsAppFaqData {
  pageUid: string;
  pageName: string;
  heading: string;
  whatsappLabel: string;
  whatsappNumber: string;
  faqs: WhatsAppFaqItem[];
}

export interface WhatsAppFaqPayload extends IWhatsAppFaqData {
  paddingX: number;
  paddingY: number;
}

export interface WhatsAppFaqProps {
  data?: IWhatsAppFaqData | WhatsAppFaqPayload | string;
}

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataWhatsAppFaq: IWhatsAppFaqData = {
  pageUid: "whatsapp-faq-uid",
  pageName: "NexaMart WhatsApp",
  heading: "NexaMart-এ যোগাযোগ করুন",
  whatsappLabel: "WhatsApp করুন",
  whatsappNumber: "+8801711111111",
  faqs: [],
};

export const defaultWhatsAppFaqItem: WhatsAppFaqItem = { question: "নতুন প্রশ্ন", answer: "প্রশ্নের উত্তর লিখুন।" };
