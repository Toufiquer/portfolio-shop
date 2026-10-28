/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type ProductSocialIcon = "facebook" | "linkedin" | "pin" | "message-circle" | "mail";

export interface ProductShowcaseSocial {
  id: number;
  icon: ProductSocialIcon;
  link: string;
}

export interface ProductShowcaseTimer {
  days?: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type ProductStatus = "active" | "hide" | "draft";
export type ImageValue = { url: string; name: string };

export interface ProductItem {
  _id?: string;
  title: string;
  real_price: number;
  discount_price: number;
  description: string;
  features: string[];
  star: number;
  view: string;
  discount: number;
  primary_images: ImageValue;
  product_images: ImageValue[];
  status: ProductStatus;
  offerEnds: string;
  shareButtonsVisible: boolean;
  uploadProduct?: ImageValue;
  liveUrl: string;
  VideoUrl: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export type DetailsPageProductItem = ProductItem;

export interface IDetailsPageData {
  pageUid: string;
  pageName: string;
  imageUrl: string;
  imageAlt: string;
  categoryTitle: string;
  priceLabel: string;
  price: string;
  productTitle: string;
  features: string[];
  timer: ProductShowcaseTimer;
  buyButtonText: string;
  membershipButtonText: string;
  tutorialButtonText: string;
  liveDemoUrl: string;
  videoUrl: string;
  downloadUrl: string;
  downloadLinkText: string;
  productDescriptions: string;
  productLookupLimit: number;
  shareButtonsVisible: boolean;
  socials: ProductShowcaseSocial[];
}

export interface DetailsPagePayload extends IDetailsPageData {
  paddingX: number;
  paddingY: number;
}

export interface DetailsPageProps {
  data?: IDetailsPageData | DetailsPagePayload | string;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export interface DetailsPageGtmEventData {
  sectionData: IDetailsPageData;
  product?: DetailsPageProductItem;
  isReady: boolean;
}

export const plainTextToRichText = (value: string) =>
  JSON.stringify({
    root: {
      children: value.split("\n").map((line) => ({
        children: line
          ? [{ detail: 0, format: 0, mode: "normal", style: "", text: line, type: "text", version: 1 }]
          : [],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      })),
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  });

export const toRichTextContent = (value: string) => {
  try {
    const parsed = JSON.parse(value) as { root?: unknown };
    if (parsed && typeof parsed === "object" && parsed.root) return value;
  } catch {
    // Existing details-page descriptions were plain text; convert them below.
  }
  return plainTextToRichText(value);
};

export const defaultDataDetailsPage: IDetailsPageData = {
  pageUid: "details-page-uid",
  pageName: "Product Showcase",
  imageUrl: "/Logo.png",
  imageAlt: "NexaMart product image",
  categoryTitle: "Products",
  priceLabel: "Price",
  price: "",
  productTitle: "",
  features: [],
  productDescriptions: plainTextToRichText(""),
  timer: {
    hours: 0,
    minutes: 0,
    seconds: 0,
  },
  buyButtonText: "Buy Now",
  membershipButtonText: "",
  tutorialButtonText: "",
  liveDemoUrl: "",
  videoUrl: "",
  downloadUrl: "",
  downloadLinkText: "",
  productLookupLimit: 20,
  shareButtonsVisible: false,
  socials: [],
};
