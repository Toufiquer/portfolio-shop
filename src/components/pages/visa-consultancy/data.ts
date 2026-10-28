/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface ConsultancyStat {
  id: string;
  value: string;
  label: string;
}

export interface ConsultancyService {
  id: string;
  title: string;
  description: string;
  outcome: string;
}

export interface ConsultancyStep {
  id: string;
  title: string;
  description: string;
  milestone: string;
}

export interface ConsultancyDestination {
  id: string;
  country: string;
  flag: string;
  focus: string;
  description: string;
}

export interface ReadinessGroup {
  id: string;
  title: string;
  description: string;
  items: string[];
}

export interface ConsultancyBenefit {
  id: string;
  title: string;
  description: string;
}

export interface ConsultancyTestimonial {
  id: string;
  quote: string;
  name: string;
  journey: string;
}

export interface ConsultancyFaq {
  id: string;
  question: string;
  answer: string;
}

export interface IVisaConsultancyData {
  pageUid: string;
  pageName: string;
  eyebrow: string;
  showHeroEyebrow: boolean;
  heroTitle: string;
  heroDescription: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  heroNote: string;
  stats: ConsultancyStat[];
  servicesEyebrow: string;
  showServicesEyebrow: boolean;
  servicesTitle: string;
  servicesDescription: string;
  services: ConsultancyService[];
  journeyEyebrow: string;
  showJourneyEyebrow: boolean;
  journeyTitle: string;
  journeyDescription: string;
  journeySteps: ConsultancyStep[];
  destinationsEyebrow: string;
  showDestinationsEyebrow: boolean;
  destinationsTitle: string;
  destinationsDescription: string;
  destinations: ConsultancyDestination[];
  readinessEyebrow: string;
  showReadinessEyebrow: boolean;
  readinessTitle: string;
  readinessDescription: string;
  readinessGroups: ReadinessGroup[];
  benefitsEyebrow: string;
  showBenefitsEyebrow: boolean;
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: ConsultancyBenefit[];
  storiesEyebrow: string;
  showStoriesEyebrow: boolean;
  storiesTitle: string;
  storiesDescription: string;
  testimonials: ConsultancyTestimonial[];
  faqEyebrow: string;
  showFaqEyebrow: boolean;
  faqTitle: string;
  faqDescription: string;
  faqs: ConsultancyFaq[];
  ctaTitle: string;
  ctaEyebrow: string;
  showCtaEyebrow: boolean;
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

export interface VisaConsultancyPayload extends IVisaConsultancyData {
  paddingX: number;
  paddingY: number;
}

export interface VisaConsultancyProps {
  data?: IVisaConsultancyData | VisaConsultancyPayload | string;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export const defaultDataVisaConsultancy: IVisaConsultancyData = {
  pageUid: "visa-consultancy-uid",
  pageName: "",
  eyebrow: "",
  showHeroEyebrow: false,
  heroTitle: "",
  heroDescription: "",
  primaryButtonText: "",
  primaryButtonUrl: "",
  secondaryButtonText: "",
  secondaryButtonUrl: "",
  heroNote: "",
  stats: [],
  servicesEyebrow: "",
  showServicesEyebrow: false,
  servicesTitle: "",
  servicesDescription: "",
  services: [],
  journeyEyebrow: "",
  showJourneyEyebrow: false,
  journeyTitle: "",
  journeyDescription: "",
  journeySteps: [],
  destinationsEyebrow: "",
  showDestinationsEyebrow: false,
  destinationsTitle: "",
  destinationsDescription: "",
  destinations: [],
  readinessEyebrow: "",
  showReadinessEyebrow: false,
  readinessTitle: "",
  readinessDescription: "",
  readinessGroups: [],
  benefitsEyebrow: "",
  showBenefitsEyebrow: false,
  benefitsTitle: "",
  benefitsDescription: "",
  benefits: [],
  storiesEyebrow: "",
  showStoriesEyebrow: false,
  storiesTitle: "",
  storiesDescription: "",
  testimonials: [],
  faqEyebrow: "",
  showFaqEyebrow: false,
  faqTitle: "",
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
  backgroundColor: "",
  surfaceColor: "",
  headingColor: "",
  textColor: "",
  accentColor: "",
  accentDarkColor: "",
};
