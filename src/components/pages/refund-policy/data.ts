/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface RefundPolicySection {
  id?: string;
  eyebrow?: string;
  showEyebrow: boolean;
  title: string;
  description?: string;
  items?: string[];
}
export interface IPage7Data {
  pageUid: string;
  pageName: string;
  title: string;
  eyebrow: string;
  showEyebrow: boolean;
  image: string;
  paddingX: number;
  paddingY: number;
  lastUpdatedLabel: string;
  highlightTitle: string;
  highlightDescription: string;
  sections: RefundPolicySection[];
  contactTitle: string;
  contactDescription: string;
  supportEmail: string;
}
export interface Page7Props {
  data?: IPage7Data | string;
}

export const defaultRefundPolicySection: RefundPolicySection = {
  eyebrow: "New section",
  showEyebrow: true,
  title: "New Policy Section",
  description: "Write the policy details for this section.",
  items: [],
};

export const defaultDataPage7: IPage7Data = {
  pageUid: "page-uid-refund-policy",
  pageName: "Refund Policy",
  title: "Refund Policy",
  eyebrow: "Refund and cancellation guidance",
  showEyebrow: true,
  image: "/images/all-pages-placeholder.png",
  paddingX: 0,
  paddingY: 0,
  lastUpdatedLabel: "",
  highlightTitle: "",
  highlightDescription: "",
  sections: [],
  contactTitle: "Contact NexaMart",
  contactDescription: "For questions, contact us by phone, WhatsApp, or email.",
  supportEmail: "example@gmail.com",
};
