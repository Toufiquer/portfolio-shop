/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type ContainerSortMode = "ascending" | "descending" | "custom";
export type ContainerGridLayout = "1x1" | "1x2" | "1x3";
export type ContainerMobileGridLayout = "1x1" | "1x2";

export interface SeeMoreConfig {
  name: string;
  url: string;
}

export interface TemplateItem {
  id: number;
  sourceProductId?: string;
  productUID?: string;
  title: string;
  price: string;
  views: string;
  rating: number;
  image: string;
  url?: string;
  visible?: boolean;
}

export interface IContainerData {
  containerUid: string;
  containerName: string;
  title: string;
  sectionTitle?: string;
  sortMode: ContainerSortMode;
  gridLayout: ContainerGridLayout;
  mobileGridLayout: ContainerMobileGridLayout;
  seeMore: SeeMoreConfig;
  showSeeMore: boolean;
  viewMoreText?: string;
  buyButtonText: string;
  paddingX?: string;
  paddingY?: string;
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontColor?: string;
  titleFontWeight?: string;
  templates: TemplateItem[];
}

export interface ContainerProps {
  data?: IContainerData | string;
}

export const templateImagePlaceholder = "/Logo.png";

export const defaultDataContainer1: IContainerData = {
  containerUid: "container-uid-1",
  containerName: "Products",
  title: "Shop products",
  sortMode: "custom",
  gridLayout: "1x3",
  mobileGridLayout: "1x1",
  seeMore: {
    name: "Browse products",
    url: "/products",
  },
  showSeeMore: true,
  buyButtonText: "Buy Now",
  paddingX: "0",
  paddingY: "0",
  titleFontFamily: "inherit",
  titleFontSize: "24",
  titleFontColor: "#2563eb",
  titleFontWeight: "700",
  templates: [],
};

export default defaultDataContainer1;
