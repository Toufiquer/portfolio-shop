/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

export type ContainerSortMode = "ascending" | "descending" | "custom";
export type ContainerGridLayout = "1x1" | "1x2" | "1x3";
export type ContainerMobileGridLayout = "1x1" | "1x2";
export const containerGridItemWidth: Record<ContainerGridLayout, string> = {
  "1x1": "100%",
  "1x2": "50%",
  "1x3": `${100 / 3}%`,
};

export const containerMobileGridItemWidth: Record<ContainerMobileGridLayout, string> = {
  "1x1": "100%",
  "1x2": "50%",
};

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
  showBottomNavigation: boolean;
  viewMoreText?: string;
  buyButtonText: string;
  templates: TemplateItem[];
}

export interface ContainerProps {
  data?: IContainerData | string;
}

export const templateImagePlaceholder = "https://i.ibb.co/j3Z3BK6/marketing.png";

export const defaultDataContainer2: IContainerData = {
  containerUid: "container-uid-2",
  containerName: "All Theme",
  title: "All Theme",
  sortMode: "custom",
  gridLayout: "1x3",
  mobileGridLayout: "1x1",
  seeMore: {
    name: "See More",
    url: "/all-container",
  },
  showSeeMore: true,
  showBottomNavigation: true,
  buyButtonText: "Buy Now",
  templates: [
    {
      id: 1,
      title: "ShopMart - Premium Daraz Website Template",
      productUID: "THEME-001",
      price: "1,750৳",
      views: "0.2k",
      rating: 5,
      image: templateImagePlaceholder,
    },
    {
      id: 2,
      title: "News Paper WordPress Template",
      productUID: "THEME-002",
      price: "1,750৳",
      views: "60",
      rating: 5,
      image: templateImagePlaceholder,
    },
    {
      id: 3,
      title: "Ads-Report WordPress Website Template",
      productUID: "THEME-003",
      price: "0৳",
      views: "1.1k",
      rating: 5,
      image: templateImagePlaceholder,
    },
    {
      id: 4,
      title: "EcoMart - Premium Ecommerce Template",
      productUID: "THEME-004",
      price: "1,750৳",
      views: "1k",
      rating: 5,
      image: templateImagePlaceholder,
    },
  ],
};

export default defaultDataContainer2;
