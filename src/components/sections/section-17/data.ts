/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section17Props {
  data?: Section17Data | Section17Payload | string;
}

export interface Section17Data {
  id: string;
  sectionUid: string;
  buttonName: string;
  buttonIcon: string;
  buttonPath: string;
  isNewTab: boolean;
  buttonSize: "default" | "sm" | "lg" | "xl" | "xs";
  buttonWidth: "auto" | "full" | "fixed-sm" | "fixed-md" | "fixed-lg" | "fixed-xl";
  buttonVariant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "garden"
    | "fire"
    | "water"
    | "outlineGarden"
    | "outlineFire"
    | "outlineWater"
    | "outlineDefault"
    | "outlineGlassy"
    | "glassyPrimary"
    | "glassySuccess"
    | "glassyDanger"
    | "glassyWarning"
    | "glassyInfo"
    | "glassyDark"
    | "glassyLight"
    | "neonBlue"
    | "neonPink"
    | "neonGreen"
    | "neonPurple";
}

export const defaultDataSection17: Section17Data = {
  id: "section-uid-17",
  sectionUid: "section-uid-17",
  buttonName: "Browse products",
  buttonIcon: "doc-icon",
  buttonPath: "/products",
  isNewTab: false,
  buttonVariant: "neonBlue",
  buttonSize: "default",
  buttonWidth: "auto",
};

export interface Section17Payload extends Section17Data {
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export interface Section17FormProps {
  data?: Section17Data | Section17Payload;
  onChange?: (values: Section17Data | Section17Payload) => void;
  onSubmit?: (values: Section17Data | Section17Payload) => void;
}
