/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section20Props {
  data?: Section20Data | Section20Payload | string;
}

export interface ILogoItem {
  id: string;
  image: string;
  alt: string;
  link?: string;
}

export type NavPosition = "middle-outside" | "bottom-outside" | "hidden";

export interface Section20Data {
  id: string;
  logos: ILogoItem[];
  sectionUid: string;
  responsive: {
    mobile: number;
    tablet: number;
    desktop: number;
  };

  autoplaySpeed: number;
  isAutoplay: boolean;
  infiniteLoop: boolean;
  pauseOnHover: boolean;

  navPosition: NavPosition;
  gap: "sm" | "md" | "lg" | "xl";
  grayscale: boolean;
}

export const defaultDataSection20: Section20Data = {
  id: "section-uid-20",
  sectionUid: "section-uid-20",
  logos: [],
  responsive: {
    mobile: 2,
    tablet: 3,
    desktop: 5,
  },
  autoplaySpeed: 3000,
  isAutoplay: true,
  infiniteLoop: true,
  pauseOnHover: true,
  navPosition: "hidden",
  gap: "lg",
  grayscale: true,
};

export interface Section20Payload extends Section20Data {
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export interface Section20FormProps {
  data?: Section20Data | Section20Payload;
  onChange?: (values: Section20Data | Section20Payload) => void;
  onSubmit?: (values: Section20Data | Section20Payload) => void;
}
