/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface BangladeshVisaStat {
  id: string;
  value: string;
  label: string;
}

export interface BangladeshVisaService {
  id: string;
  title: string;
  description: string;
  highlight: string;
}

export interface BangladeshVisaStep {
  id: string;
  title: string;
  description: string;
  outcome: string;
}

export interface BangladeshDocumentGroup {
  id: string;
  title: string;
  description: string;
  items: string[];
}

export interface BangladeshSupportLocation {
  id: string;
  city: string;
  mode: string;
  description: string;
}

export interface BangladeshVisaFeature {
  id: string;
  title: string;
  description: string;
}

export interface BangladeshVisaFaq {
  id: string;
  question: string;
  answer: string;
}

export interface IVisaApplicationSupportData {
  pageUid: string;
  pageName: string;
  heroEyebrow: string;
  showHeroEyebrow: boolean;
  heroTitle: string;
  heroDescription: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  heroNotice: string;
  stats: BangladeshVisaStat[];
  servicesTitle: string;
  servicesEyebrow: string;
  showServicesEyebrow: boolean;
  servicesDescription: string;
  services: BangladeshVisaService[];
  processTitle: string;
  processEyebrow: string;
  showProcessEyebrow: boolean;
  processDescription: string;
  processSteps: BangladeshVisaStep[];
  documentsTitle: string;
  documentsEyebrow: string;
  showDocumentsEyebrow: boolean;
  documentsDescription: string;
  documentGroups: BangladeshDocumentGroup[];
  locationsTitle: string;
  locationsEyebrow: string;
  showLocationsEyebrow: boolean;
  locationsDescription: string;
  supportLocations: BangladeshSupportLocation[];
  featuresTitle: string;
  featuresEyebrow: string;
  showFeaturesEyebrow: boolean;
  featuresDescription: string;
  features: BangladeshVisaFeature[];
  faqTitle: string;
  faqEyebrow: string;
  showFaqEyebrow: boolean;
  faqDescription: string;
  faqs: BangladeshVisaFaq[];
  ctaTitle: string;
  ctaEyebrow: string;
  showCtaEyebrow: boolean;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  companyName: string;
  companyEmail: string;
  companyContact: string;
  officeAddress: string;
  backgroundColor: string;
  surfaceColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
  accentDarkColor: string;
}

export interface VisaApplicationSupportPayload extends IVisaApplicationSupportData {
  paddingX: number;
  paddingY: number;
}

export interface VisaApplicationSupportProps {
  data?: IVisaApplicationSupportData | VisaApplicationSupportPayload | string;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export const defaultDataVisaApplicationSupport: IVisaApplicationSupportData = {
  pageUid: "visa-application-support-uid",
  pageName: "",
  heroEyebrow: "",
  showHeroEyebrow: false,
  heroTitle: "",
  heroDescription: "",
  primaryButtonText: "",
  primaryButtonUrl: "",
  secondaryButtonText: "",
  secondaryButtonUrl: "",
  heroNotice: "",
  stats: [],
  servicesTitle: "",
  servicesEyebrow: "",
  showServicesEyebrow: false,
  servicesDescription: "",
  services: [],
  processTitle: "",
  processEyebrow: "",
  showProcessEyebrow: false,
  processDescription: "",
  processSteps: [],
  documentsTitle: "",
  documentsEyebrow: "",
  showDocumentsEyebrow: false,
  documentsDescription: "",
  documentGroups: [],
  locationsTitle: "",
  locationsEyebrow: "",
  showLocationsEyebrow: false,
  locationsDescription: "",
  supportLocations: [],
  featuresTitle: "",
  featuresEyebrow: "",
  showFeaturesEyebrow: false,
  featuresDescription: "",
  features: [],
  faqTitle: "",
  faqEyebrow: "",
  showFaqEyebrow: false,
  faqDescription: "",
  faqs: [],
  ctaTitle: "",
  ctaEyebrow: "",
  showCtaEyebrow: false,
  ctaDescription: "",
  ctaButtonText: "",
  ctaButtonUrl: "",
  companyName: "",
  companyEmail: "",
  companyContact: "",
  officeAddress: "",
  backgroundColor: "",
  surfaceColor: "",
  headingColor: "",
  textColor: "",
  accentColor: "",
  accentDarkColor: "",
};
