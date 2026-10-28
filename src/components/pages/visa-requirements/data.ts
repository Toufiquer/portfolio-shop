/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface VisaRequirementSection {
  id: string;
  title: string;
  items: string[];
}

export interface VisaCountry {
  id: string;
  slug: string;
  flag: string;
  name: string;
  successRate?: string;
  tuitionRange: string;
  tuitionBand: string;
  processingTime: string;
  processingBand: string;
  requiredFunds: string;
  financialBand: string;
  workHours: string;
  prOpportunity: string;
  studyLevels: string[];
  visaType: string;
  englishRequirement: string;
  overview: string;
  countrySpecificRequirements: string[];
  estimatedCosts: string[];
}

export interface VisaTimelineStep {
  id: string;
  title: string;
  description: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: string[];
}

export interface DownloadResource {
  id: string;
  title: string;
  description: string;
  format: string;
  url: string;
  content: string[];
}

export interface VisaFaq {
  id: string;
  question: string;
  answer: string;
}

export interface IVisaRequirementsData {
  pageUid: string;
  pageName: string;
  eyebrow: string;
  showEyebrow: boolean;
  heroTitle: string;
  heroDescription: string;
  exploreButtonText: string;
  exploreButtonUrl: string;
  checklistButtonText: string;
  checklistButtonUrl: string;
  searchPlaceholder: string;
  countriesTitle: string;
  countriesDescription: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  countries: VisaCountry[];
  requirementSections: VisaRequirementSection[];
  timelineEyebrow: string;
  showTimelineEyebrow: boolean;
  timelineTitle: string;
  timelineDescription: string;
  timeline: VisaTimelineStep[];
  checklistEyebrow: string;
  showChecklistEyebrow: boolean;
  checklistTitle: string;
  checklistDescription: string;
  checklistGroups: ChecklistGroup[];
  downloadsEyebrow: string;
  showDownloadsEyebrow: boolean;
  downloadsTitle: string;
  downloadsDescription: string;
  downloadCompanyName: string;
  downloadCompanyEmail: string;
  downloadCompanyContact: string;
  downloads: DownloadResource[];
  faqEyebrow: string;
  showFaqEyebrow: boolean;
  faqTitle: string;
  faqDescription: string;
  faqSearchPlaceholder: string;
  faqs: VisaFaq[];
  ctaTitle: string;
  ctaDescription: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  backgroundColor: string;
  surfaceColor: string;
  headingColor: string;
  textColor: string;
  accentColor: string;
  accentDarkColor: string;
}

export interface VisaRequirementsPayload extends IVisaRequirementsData {
  paddingX: number;
  paddingY: number;
}

export interface VisaRequirementsProps {
  data?: IVisaRequirementsData | VisaRequirementsPayload | string;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export const defaultDataVisaRequirements: IVisaRequirementsData = {
  pageUid: "visa-requirements-uid",
  pageName: "",
  eyebrow: "",
  showEyebrow: false,
  heroTitle: "",
  heroDescription: "",
  exploreButtonText: "",
  exploreButtonUrl: "",
  checklistButtonText: "",
  checklistButtonUrl: "",
  searchPlaceholder: "",
  countriesTitle: "",
  countriesDescription: "",
  emptyStateTitle: "",
  emptyStateDescription: "",
  countries: [],
  requirementSections: [],
  timelineEyebrow: "",
  showTimelineEyebrow: false,
  timelineTitle: "",
  timelineDescription: "",
  timeline: [],
  checklistEyebrow: "",
  showChecklistEyebrow: false,
  checklistTitle: "",
  checklistDescription: "",
  checklistGroups: [],
  downloadsEyebrow: "",
  showDownloadsEyebrow: false,
  downloadsTitle: "",
  downloadsDescription: "",
  downloadCompanyName: "",
  downloadCompanyEmail: "",
  downloadCompanyContact: "",
  downloads: [],
  faqEyebrow: "",
  showFaqEyebrow: false,
  faqTitle: "",
  faqDescription: "",
  faqSearchPlaceholder: "",
  faqs: [],
  ctaTitle: "",
  ctaDescription: "",
  primaryButtonText: "",
  primaryButtonUrl: "",
  secondaryButtonText: "",
  secondaryButtonUrl: "",
  backgroundColor: "",
  surfaceColor: "",
  headingColor: "",
  textColor: "",
  accentColor: "",
  accentDarkColor: "",
};
