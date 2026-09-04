/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

import type { PageTemplateData } from "../shared/page-types";

export type ISiteTermsAndConditionsData = PageTemplateData;

export interface SiteTermsAndConditionsPayload extends ISiteTermsAndConditionsData {
  paddingX: number;
  paddingY: number;
}

export type SiteTermsAndConditionsProps = {
  data?: ISiteTermsAndConditionsData | SiteTermsAndConditionsPayload | string;
};

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataSiteTermsAndConditions: ISiteTermsAndConditionsData = {
  pageUid: "site-terms-and-conditions-uid",
  pageName: "Site Terms & Conditions",
  eyebrow: "Terms & Conditions",
  title: "The rules and responsibilities for using Site's website and services.",
  subtitle:
    "These demo Terms & Conditions explain how Site may provide services, outline client responsibilities, and describe payments, intellectual property, and limitations of liability. Update the content for your company and local legal requirements before publishing.",
  primaryAction: "Read Terms",
  secondaryAction: "Contact Site",
  sections: [
    {
      eyebrow: "Acceptance",
      title: "Using the website",
      description:
        "By browsing this website, submitting forms, or requesting services from Site, visitors agree to these demo terms.",
      items: [
        "Use the website lawfully",
        "Provide accurate information",
        "Stop using the website if terms are not accepted",
      ],
    },
    {
      eyebrow: "Services",
      title: "Project scope and delivery",
      description:
        "Site confirms service scope, timelines, deliverables, revisions, and handover details in the applicable client agreement.",
      items: [
        "Scope is agreed before work starts",
        "Change requests may affect cost or timeline",
        "Client feedback is required for progress",
      ],
    },
    {
      eyebrow: "Payments",
      title: "Fees and billing",
      description:
        "Set basic expectations around invoices, payment schedules, deposits, and work pauses caused by overdue payments.",
      items: ["Payment terms are shared in proposals", "Deposits may be required", "Late payments can delay delivery"],
    },
    {
      eyebrow: "Ownership",
      title: "Content and intellectual property",
      description:
        "Explain ownership of client-provided content, delivered assets, third-party tools, and reusable development patterns.",
      items: [
        "Client owns provided brand assets",
        "Final ownership follows payment and agreement",
        "Third-party tools follow their own licenses",
      ],
    },
    {
      eyebrow: "Contact",
      title: "Terms questions and support",
      description:
        "Contact Site if you have questions or need clarification about these Terms & Conditions. Replace these demo details with your own before publishing.",
      items: ["Email: hello@example.com", "Contact: 017 11112222"],
    },
  ],
};
