/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

import type { PageTemplateData, PageTemplateProps } from "../shared/page-types";

export type ISitePrivacyPolicyData = PageTemplateData;
export interface SitePrivacyPolicyPayload extends ISitePrivacyPolicyData {
  paddingX: number;
  paddingY: number;
}
export type SitePrivacyPolicyProps = PageTemplateProps<ISitePrivacyPolicyData | SitePrivacyPolicyPayload>;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataSitePrivacyPolicy: ISitePrivacyPolicyData = {
  pageUid: "site-privacy-policy-uid",
  pageName: "Site Privacy Policy",
  eyebrow: "Privacy Policy",
  title: "How Site collects, uses, protects, and respects your information.",
  subtitle:
    "This demo Privacy Policy explains how Site may handle personal information, cookies, information sharing, and user rights. Update it to match your company, services, and local legal requirements before publishing.",
  primaryAction: "Review Policy",
  secondaryAction: "Contact Site",
  sections: [
    {
      eyebrow: "Data Collection",
      title: "Information we may collect",
      description:
        "Site may collect the information visitors provide through forms, requests, or support conversations, along with limited technical information needed to operate and improve the website.",
      items: [
        "Contact details submitted through forms",
        "Basic website usage and device information",
        "Project details shared by the visitor",
      ],
    },
    {
      eyebrow: "Use Of Data",
      title: "Why information is used",
      description:
        "Clarify that collected information supports communication, service delivery, website improvement, and security.",
      items: ["Reply to inquiries and support requests", "Improve website experience", "Protect services from misuse"],
    },
    {
      eyebrow: "Protection",
      title: "How information is protected",
      description:
        "Describe practical safeguards and responsible handling without making unrealistic security promises.",
      items: [
        "Limited access to submitted information",
        "Reasonable technical safeguards",
        "Data kept only as long as needed",
      ],
    },
    {
      eyebrow: "Rights",
      title: "User choices and requests",
      description:
        "For privacy questions, access requests, corrections, or deletion requests, contact Site using the demo details below. Replace these details with your own before publishing.",
      items: [
        "Email: hello@example.com",
        "Contact: 017 11112222",
        "Request a copy, correction, or deletion of submitted details",
      ],
    },
  ],
};

export const defaultSitePrivacyPolicySection = {
  eyebrow: "New policy area",
  title: "Add a policy section title",
  description: "Explain this part of your privacy policy in clear, visitor-friendly language.",
  items: ["Add the first policy point"],
};
