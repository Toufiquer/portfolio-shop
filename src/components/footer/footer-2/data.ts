/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
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
  foreground: "#334155",
  accent: "#b45309",
  brand: "Site Name",
  tagline: "Technology built for what comes next",
  description:
    "We build secure, reliable digital products that help ambitious teams work smarter, serve customers better, and grow with confidence.",
  logoUrl: "/Logo.png",
  logoAlt: "Site Name logo",
  showLogo: true,
  email: "support@example.com",
  phone: "01711112222",
  disabledPaths: ["/dashboard", "/login", "/forgot-password", "/registration"],
  columns: [
    {
      title: "Solutions",
      links: [
        { id: "web-development", label: "Web Development", url: "/", visible: true },
        { id: "mobile-apps", label: "Mobile Applications", url: "/", visible: true },
        { id: "cloud-solutions", label: "Cloud Solutions", url: "/", visible: true },
        { id: "automation", label: "AI & Automation", url: "/", visible: true },
      ],
    },
    {
      title: "Company",
      links: [
        { id: "about", label: "About Us", url: "/", visible: true },
        { id: "team", label: "Our Team", url: "/", visible: true },
        { id: "careers", label: "Careers", url: "/", visible: true },
        { id: "contact", label: "Contact", url: "/", visible: true },
        { id: "insights", label: "Insights", url: "/", visible: true },
      ],
    },
  ],
  links: [
    { id: "home", label: "Home", url: "/", visible: true },
    { id: "services", label: "Services", url: "/", visible: true },
    { id: "contact", label: "Contact", url: "/", visible: true },
  ],
  copyright: `All Rights Reserved © ${new Date().getFullYear()} - Site Name `,
  showLegalBar: true,
  legalBackground: "#f8fafc",
  legalLinks: [
    { id: "refund", label: "Refund Policy", url: "/refund-policy", visible: true },
    { id: "privacy", label: "Privacy Policy", url: "/privacy-policy", visible: true },
    { id: "terms", label: "Terms & Conditions", url: "/terms-and-condition", visible: true },
    { id: "security", label: "Security", url: "/", visible: true },
    { id: "cookies", label: "Cookie Policy", url: "/", visible: true },
  ],
};
