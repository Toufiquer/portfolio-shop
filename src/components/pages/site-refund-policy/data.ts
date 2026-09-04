/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

export interface RefundPolicySection {
  title: string;
  description?: string;
  items?: string[];
}

export interface ISiteRefundPolicyData {
  pageUid: string;
  pageName: string;
  title: string;
  lastUpdatedLabel: string;
  sections: RefundPolicySection[];
  contactTitle: string;
  contactDescription: string;
  supportEmail: string;
}

export interface SiteRefundPolicyPayload extends ISiteRefundPolicyData {
  paddingX: number;
  paddingY: number;
}

export interface SiteRefundPolicyProps {
  data?: ISiteRefundPolicyData | SiteRefundPolicyPayload | string;
}

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataSiteRefundPolicy: ISiteRefundPolicyData = {
  pageUid: "site-refund-policy-uid",
  pageName: "Site Refund Policy",
  title: "Site Refund Policy",
  lastUpdatedLabel: "Last updated: Today",
  sections: [
    {
      title: "1. Overview",
      description:
        "Site wants every customer to understand the applicable refund terms clearly. If you have a concern about a purchase or service, support is available to help.",
    },
    {
      title: "2. Returns Eligibility",
      description: "To be eligible for a return, please ensure that:",
      items: [
        "The product was purchased within the last 30 days.",
        "The product is in its original, unused, and undamaged condition.",
        "You have the receipt or proof of purchase.",
      ],
    },
    {
      title: "3. Refund Process",
      description:
        "Once we receive your item, we will inspect it and notify you that we have received your returned item. If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer's policies.",
    },
    {
      title: "4. Shipping Costs",
      description:
        "You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.",
    },
  ],
  contactTitle: "Contact Site",
  contactDescription:
    "For refund questions or assistance, email hello@example.com or call 017 11112222. Replace these demo details with your own contact information before publishing.",
  supportEmail: "hello@example.com",
};

export const defaultSiteRefundPolicySection: RefundPolicySection = {
  title: "New Policy Section",
  description: "Write the policy details for this section.",
  items: [],
};
