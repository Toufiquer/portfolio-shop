/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
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
  eyebrow: "",
  title: "Security information",
  subtitle: "",
  primaryAction: "",
  secondaryAction: "",
  sections: [],
};

export const defaultSecuritySection = {
  eyebrow: "New security area",
  title: "Add a security section title",
  description: "Explain this security practice in clear, visitor-friendly language.",
  items: ["Add the first security point"],
};
