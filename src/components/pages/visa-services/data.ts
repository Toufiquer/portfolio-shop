/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface CatalogueStat {
  id: string;
  value: string;
  label: string;
}

export interface CatalogueService {
  id: string;
  slug: string;
  eyebrow: string;
  showEyebrow?: boolean;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  outcome: string;
  duration: string;
  features: string[];
  process: string[];
  ctaText: string;
  ctaUrl: string;
}

export interface CatalogueStep {
  id: string;
  title: string;
  description: string;
}

export interface CatalogueBenefit {
  id: string;
  title: string;
  description: string;
}

export interface CatalogueFaq {
  id: string;
  question: string;
  answer: string;
}

export interface IVisaServicesData {
  pageUid: string;
  pageName: string;
  eyebrow: string;
  showEyebrow: boolean;
  heroTitle: string;
  heroDescription: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  trustNote: string;
  stats: CatalogueStat[];
  catalogueEyebrow: string;
  showCatalogueEyebrow: boolean;
  catalogueTitle: string;
  catalogueDescription: string;
  services: CatalogueService[];
  processEyebrow: string;
  showProcessEyebrow: boolean;
  processTitle: string;
  processDescription: string;
  processSteps: CatalogueStep[];
  benefitsEyebrow: string;
  showBenefitsEyebrow: boolean;
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: CatalogueBenefit[];
  faqEyebrow: string;
  showFaqEyebrow: boolean;
  faqTitle: string;
  faqDescription: string;
  faqs: CatalogueFaq[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  companyName: string;
  companyEmail: string;
  companyContact: string;
  backgroundColor: string;
  surfaceColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
  accentDarkColor: string;
}

export interface VisaServicesPayload extends IVisaServicesData {
  paddingX: number;
  paddingY: number;
}

export interface VisaServicesProps {
  data?: IVisaServicesData | VisaServicesPayload | string;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export const defaultDataVisaServices: IVisaServicesData = {
  pageUid: "visa-services-uid",
  pageName: "",
  eyebrow: "",
  showEyebrow: false,
  heroTitle: "",
  heroDescription: "",
  primaryButtonText: "",
  primaryButtonUrl: "",
  secondaryButtonText: "",
  secondaryButtonUrl: "",
  trustNote: "",
  stats: [],
  catalogueEyebrow: "",
  showCatalogueEyebrow: false,
  catalogueTitle: "",
  catalogueDescription: "",
  services: [],
  processEyebrow: "",
  showProcessEyebrow: false,
  processTitle: "",
  processDescription: "",
  processSteps: [],
  benefitsEyebrow: "",
  showBenefitsEyebrow: false,
  benefitsTitle: "",
  benefitsDescription: "",
  benefits: [],
  faqEyebrow: "",
  showFaqEyebrow: false,
  faqTitle: "",
  faqDescription: "",
  faqs: [],
  ctaTitle: "",
  ctaDescription: "",
  ctaButtonText: "",
  ctaButtonUrl: "",
  companyName: "",
  companyEmail: "",
  companyContact: "",
  backgroundColor: "",
  surfaceColor: "",
  headingColor: "",
  textColor: "",
  accentColor: "",
  accentDarkColor: "",
};
