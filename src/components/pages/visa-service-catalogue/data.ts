/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface VisaServiceCatalogueItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  points: string[];
}

export interface IVisaServiceCatalogueData {
  pageUid: string;
  pageName: string;
  services: VisaServiceCatalogueItem[];
  backgroundColor: string;
  alternateColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
}

export interface VisaServiceCataloguePayload extends IVisaServiceCatalogueData {
  paddingX: number;
  paddingY: number;
}

export interface VisaServiceCatalogueProps {
  data?: IVisaServiceCatalogueData | VisaServiceCataloguePayload | string;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export const defaultDataVisaServiceCatalogue: IVisaServiceCatalogueData = {
  pageUid: "visa-service-catalogue-uid",
  pageName: "",
  services: [],
  backgroundColor: "",
  alternateColor: "",
  headingColor: "",
  textColor: "",
  accentColor: "",
};
