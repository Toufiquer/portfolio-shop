/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type TopBannerIcon = {
  id: string;
  label: string;
  icon: string;
  url: string;
  message: string;
  visible: boolean;
};

export type TopBannerOneData = {
  variant: "topbanner-1";
  isVisible: boolean;
  background: string;
  foreground: string;
  icons: TopBannerIcon[];
  authLabel: string;
  /** Omitted legacy values remain visible. */
  buttonVisible?: boolean;
  position: "fixed" | "sticky" | "hide";
  excludedPaths: string[];
};

export const defaultData: TopBannerOneData = {
  variant: "topbanner-1",
  isVisible: true,
  background: "#fff7e6",
  foreground: "#713f12",
  authLabel: "Login / Dashboard",
  buttonVisible: true,
  position: "sticky",
  excludedPaths: ["/dashboard", "/login", "/forgot-password", "/registration"],
  icons: [
    {
      id: "facebook",
      label: "Facebook",
      icon: "CiFacebook",
      url: "https://www.facebook.com/example",
      message: "Follow us on Facebook",
      visible: true,
    },
    {
      id: "facebook-group",
      label: "Facebook Group",
      icon: "CiFacebook",
      url: "https://www.facebook.com/groups/example",
      message: "Join our Facebook group",
      visible: true,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "FaWhatsapp",
      url: "https://wa.me/8801711111111",
      message: "Chat on WhatsApp",
      visible: true,
    },
    { id: "email", label: "Email", icon: "Mail", url: "mailto:example@gmail.com", message: "Email us", visible: true },
    { id: "call", label: "Call", icon: "Phone", url: "tel:+8801711111111", message: "Call us", visible: true },
  ],
};
