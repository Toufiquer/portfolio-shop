/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type FooterLink = { id: string; label: string; url: string; visible: boolean };
export type FooterOneData = {
  variant: "footer-1";
  isVisible: boolean;
  forceUpdate: boolean;
  background: string;
  foreground: string;
  accent: string;
  brand: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  showLogo: boolean;
  showContact: boolean;
  disabledPaths: string[];
  columns: { title: string; links: FooterLink[] }[];
  email: string;
  phone: string;
  copyright: string;
  showLegalBar: boolean;
  legalBackground: string;
  legalLinks: FooterLink[];
};

export const defaultData: FooterOneData = {
  variant: "footer-1",
  isVisible: true,
  forceUpdate: true,
  background: "#ffffff",
  foreground: "#292524",
  accent: "#111827",
  brand: "NexaMart",
  description: "NexaMart (NxMart) হলো বাংলাদেশের একটি অনলাইন শপিং প্ল্যাটফর্ম।",
  logoUrl: "/Logo.png",
  logoAlt: "NexaMart logo",
  showLogo: true,
  showContact: true,
  disabledPaths: ["/dashboard", "/login", "/forgot-password", "/registration"],
  email: "example@gmail.com",
  phone: "01711111111",
  copyright: `All Rights Reserved © ${new Date().getFullYear()} - NexaMart `,
  showLegalBar: true,
  legalBackground: "#fffaf0",
  legalLinks: [
    { id: "faq", label: "Frequently Asked Questions", url: "/frequently-ask-questions", visible: true },
    { id: "contact", label: "Contact us", url: "/contact-us", visible: true },
  ],
  columns: [
    {
      title: "Explore",
      links: [
        { id: "home", label: "Home", url: "/", visible: true },
        { id: "dashboard", label: "Dashboard", url: "/dashboard", visible: true },
      ],
    },
    {
      title: "Account",
      links: [
        { id: "login", label: "Login", url: "/login", visible: true },
        { id: "registration", label: "Registration", url: "/registration", visible: true },
      ],
    },
  ],
};
