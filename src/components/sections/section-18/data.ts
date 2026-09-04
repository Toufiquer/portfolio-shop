/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, April, 2026
|-----------------------------------------
*/

export interface Section18Props {
  data?: Section18Data | Section18Payload | string;
}

export interface ISlideItem {
  id: string;
  image: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export type NavPosition = "middle-inside" | "middle-outside" | "bottom-overlay" | "bottom-outside";
export type ItemsPerSlide = 1 | 2 | 3 | 4;

export interface Section18Data {
  id: string;
  slides: ISlideItem[];
  sectionUid: string;
  autoplaySpeed: number;
  isAutoplay: boolean;
  infiniteLoop: boolean;
  pauseOnHover: boolean;

  itemsPerSlide: ItemsPerSlide;
  navPosition: NavPosition;
  showArrowsOnHover: boolean;

  height: "auto" | "fixed-sm" | "fixed-md" | "fixed-lg" | "screen";
  overlayOpacity: number;
}

export const defaultDataSection18: Section18Data = {
  id: "section-uid-18",
  sectionUid: "section-uid-18",
  slides: [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
      title: "Modern Architecture",
      description: "Explore the beauty of lines and spaces.",
      buttonText: "View Project",
      buttonLink: "#",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
      title: "Urban Design",
      description: "Building the future of city living.",
      buttonText: "Read More",
      buttonLink: "#",
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
      title: "Interior Concepts",
      description: "Minimalist approaches to daily life.",
    },
  ],
  autoplaySpeed: 3000,
  isAutoplay: true,
  infiniteLoop: true,
  pauseOnHover: true,
  itemsPerSlide: 1,
  navPosition: "middle-inside",
  showArrowsOnHover: true,
  height: "fixed-md",
  overlayOpacity: 40,
};

export interface Section18Payload extends Section18Data {
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export interface Section18FormProps {
  data?: Section18Data | Section18Payload;
  onChange?: (values: Section18Data | Section18Payload) => void;
  onSubmit?: (values: Section18Data | Section18Payload) => void;
}
