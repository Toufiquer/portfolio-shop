/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section21Props {
  data?: Section21Data | Section21Payload | string;
}

export interface IGalleryItem {
  id: string;
  url: string;
  caption?: string;
}

export type GalleryLayout = "grid" | "masonry" | "bento" | "filmstrip";
export type HoverEffect = "zoom" | "overlay" | "grayscale" | "lift" | "none";
export type AnimationType = "fade" | "scale" | "slide-up" | "none";
export type Columns = 2 | 3 | 4 | 5;
export type Gap = "none" | "sm" | "md" | "lg";

export interface Section21Data {
  id: string;
  images: IGalleryItem[];
  sectionUid: string;
  layout: GalleryLayout;
  columns: Columns;
  gap: Gap;
  aspectRatio: "auto" | "square" | "video" | "portrait";

  hoverEffect: HoverEffect;
  animation: AnimationType;
  showCaption: boolean;

  rounded: "none" | "sm" | "md" | "lg" | "xl";
}

export const defaultDataSection21: Section21Data = {
  id: "section-uid-21",
  sectionUid: "section-uid-21",
  images: [],
  layout: "bento",
  columns: 3,
  gap: "md",
  aspectRatio: "auto",
  hoverEffect: "overlay",
  animation: "fade",
  showCaption: true,
  rounded: "lg",
};

export interface Section21Payload extends Section21Data {
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export interface Section21FormProps {
  data?: Section21Data | Section21Payload;
  onChange?: (values: Section21Data | Section21Payload) => void;
  onSubmit?: (values: Section21Data | Section21Payload) => void;
}
