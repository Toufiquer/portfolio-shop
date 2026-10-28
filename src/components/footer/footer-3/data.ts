/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type FooterThreeLink = { id: string; label: string; url: string; visible: boolean };
export type FooterThreeData = {
  variant: "footer-3";
  isVisible: boolean;
  forceUpdate: boolean;
  background: string;
  foreground: string;
  accent: string;
  logoUrl: string;
  logoAlt: string;
  showLogo: boolean;
  brand: string;
  description: string;
  disabledPaths: string[];
  destinations: FooterThreeLink[];
  services: FooterThreeLink[];
  email: string;
  phone: string;
  copyright: string;
  legalLinks: FooterThreeLink[];
  showLegalBar: boolean;
  legalBackground: string;
};
export const defaultData: FooterThreeData = {
  variant: "footer-3",
  isVisible: true,
  forceUpdate: true,
  background: "#ffffff",
  foreground: "#1c1917",
  accent: "#dc2626",
  logoUrl: "/Logo.png",
  logoAlt: "NexaMart logo",
  showLogo: true,
  brand: "NexaMart",
  description: "NexaMart (NxMart) হলো বাংলাদেশের একটি অনলাইন শপিং প্ল্যাটফর্ম।",
  disabledPaths: ["/dashboard", "/login", "/forgot-password", "/registration"],
  destinations: [
    { id: "home", label: "Home", url: "/", visible: true },
    { id: "products", label: "Products", url: "/products", visible: true },
    { id: "about", label: "About us", url: "/about-us", visible: true },
    { id: "contact", label: "Contact us", url: "/contact-us", visible: true },
  ],
  services: [],
  email: "example@gmail.com",
  phone: "01711111111",
  copyright: `All Rights Reserved © ${new Date().getFullYear()} - NexaMart `,
  legalLinks: [
    { id: "faq", label: "Frequently Asked Questions", url: "/frequently-ask-questions", visible: true },
    { id: "contact", label: "Contact us", url: "/contact-us", visible: true },
  ],
  showLegalBar: true,
  legalBackground: "#000000",
};
