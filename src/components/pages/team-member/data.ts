/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
}

export interface TeamRow {
  id: string;
  label: string;
  showEyebrow?: boolean;
  members: TeamMember[];
}

export interface IPage8Data {
  pageUid: string;
  pageName: string;
  eyebrow: string;
  showEyebrow?: boolean;
  title: string;
  description: string;
  founderLabel: string;
  showFounderLabel?: boolean;
  ceo: TeamMember;
  rows: TeamRow[];
}

export interface Page8Payload extends IPage8Data {
  paddingX: number;
  paddingY: number;
}

export interface Page8Props {
  data?: IPage8Data | Page8Payload | string;
}

export const defaultTeamMember: Omit<TeamMember, "id"> = {
  name: "New Team Member",
  title: "Role / Position",
  bio: "Write a short introduction for this team member.",
  image: "",
};
export const defaultTeamRow: Omit<TeamRow, "id" | "members"> = { label: "New Team Group" };

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataPage8: IPage8Data = {
  pageUid: "page-uid-tema-member",
  pageName: "NexaMart Team",
  eyebrow: "NexaMart · NxMart",
  showEyebrow: true,
  title: "NexaMart",
  description: "NexaMart is an online shopping platform serving customers across Bangladesh.",
  founderLabel: "Founder",
  showFounderLabel: true,
  ceo: { id: "ceo", name: "", title: "", bio: "", image: "" },
  rows: [],
};
