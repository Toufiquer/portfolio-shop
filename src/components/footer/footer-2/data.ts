/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type FooterTwoData = {
  variant: "footer-2";
  isVisible: boolean;
  forceUpdate: boolean;
  background: string;
  foreground: string;
  accent: string;
  brand: string;
  tagline: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  showLogo: boolean;
  email: string;
  phone: string;
  disabledPaths: string[];
  columns: { title: string; links: { id: string; label: string; url: string; visible: boolean }[] }[];
  links: { id: string; label: string; url: string; visible: boolean }[];
  copyright: string;
  showLegalBar: boolean;
  legalBackground: string;
  legalLinks: { id: string; label: string; url: string; visible: boolean }[];
};
export const defaultData: FooterTwoData = {
  variant: "footer-2",
  isVisible: true,
  forceUpdate: true,
  background: "#ffffff",
  foreground: "#292524",
  accent: "#b45309",
  brand: "NexaMart",
  tagline: "বাংলাদেশজুড়ে অনলাইন শপিং",
  description: "NexaMart (NxMart) হলো বাংলাদেশের একটি অনলাইন শপিং প্ল্যাটফর্ম।",
  logoUrl: "/Logo.png",
  logoAlt: "NexaMart logo",
  showLogo: true,
  email: "example@gmail.com",
  phone: "01711111111",
  disabledPaths: ["/dashboard", "/login", "/forgot-password", "/registration"],
  columns: [
    { title: "Shop", links: [{ id: "products", label: "Browse products", url: "/products", visible: true }] },
    { title: "NexaMart", links: [{ id: "contact", label: "Contact us", url: "/contact-us", visible: true }] },
  ],
  links: [{ id: "shop-all", label: "Shop all", url: "/products", visible: true }],
  copyright: `© ${new Date().getFullYear()} NexaMart. All rights reserved.`,
  showLegalBar: true,
  legalBackground: "#f8fafc",
  legalLinks: [{ id: "contact", label: "Contact us", url: "/contact-us", visible: true }],
};
