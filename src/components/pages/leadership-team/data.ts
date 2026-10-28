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
  members: TeamMember[];
}

export interface ILeadershipTeamData {
  pageUid: string;
  pageName: string;
  eyebrow: string;
  title: string;
  description: string;
  founderLabel: string;
  ceo: TeamMember;
  rows: TeamRow[];
}

export interface LeadershipTeamPayload extends ILeadershipTeamData {
  paddingX: number;
  paddingY: number;
}

export interface LeadershipTeamProps {
  data?: ILeadershipTeamData | LeadershipTeamPayload | string;
}

export const defaultLeadershipTeamMember: Omit<TeamMember, "id"> = {
  name: "New Team Member",
  title: "Role / Position",
  bio: "Write a short introduction for this team member.",
  image: "",
};
export const defaultLeadershipTeamRow: Omit<TeamRow, "id" | "members"> = { label: "New Team Group" };

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const defaultDataLeadershipTeam: ILeadershipTeamData = {
  pageUid: "leadership-team-uid",
  pageName: "NexaMart Team",
  eyebrow: "NexaMart · NxMart",
  title: "NexaMart",
  description: "NexaMart is an online shopping platform serving customers across Bangladesh.",
  founderLabel: "Founder",
  ceo: { id: "ceo", name: "", title: "", bio: "", image: "" },
  rows: [],
};
