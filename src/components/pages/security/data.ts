/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

import type { PageTemplateData, PageTemplateProps } from "../shared/page-types";

export type ISecurityData = PageTemplateData;
export interface SecurityPayload extends ISecurityData {
  paddingX: number;
  paddingY: number;
}
export type SecurityProps = PageTemplateProps<ISecurityData | SecurityPayload>;

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataSecurity: ISecurityData = {
  pageUid: "security-uid",
  pageName: "Security",
  eyebrow: "Website Security",
  title: "How Site protects its website, services, and visitor information.",
  subtitle:
    "This demo Security page explains the practical safeguards Site uses to protect its website and services. Update it to match your company, systems, and security practices before publishing.",
  primaryAction: "Review Security",
  secondaryAction: "Contact Support",
  sections: [
    {
      eyebrow: "Account Protection",
      title: "Protecting access to services",
      description:
        "Site uses appropriate controls to help protect access to website tools, customer accounts, and administrative systems.",
      items: [
        "Role-based access to sensitive systems",
        "Strong account and password practices",
        "Regular review of access permissions",
      ],
    },
    {
      eyebrow: "Technical Safeguards",
      title: "Keeping systems secure",
      description:
        "Security measures are maintained to reduce the risk of unauthorized access, alteration, or disruption of services.",
      items: ["Secure connections where available", "Routine software and security updates", "Monitoring for suspicious activity"],
    },
    {
      eyebrow: "Incident Response",
      title: "Responding to security concerns",
      description:
        "If a security concern is identified, Site investigates it promptly and takes reasonable action to contain and address the issue.",
      items: [
        "Report and assess the concern",
        "Apply appropriate corrective measures",
        "Communicate when notification is required",
      ],
    },
    {
      eyebrow: "Report A Concern",
      title: "Help us keep Site secure",
      description:
        "If you believe you have found a security issue, contact Site using the demo details below. Replace these details with your own before publishing.",
      items: [
        "Email: hello@example.com",
        "Contact: 017 11112222",
        "Share clear details so the concern can be investigated",
      ],
    },
  ],
};

export const defaultSecuritySection = {
  eyebrow: "New security area",
  title: "Add a security section title",
  description: "Explain this security practice in clear, visitor-friendly language.",
  items: ["Add the first security point"],
};
