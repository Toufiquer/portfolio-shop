/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section7Data {
  sectionUid: string;
  id: string;
  paddingX: number;
  paddingY: number;
  eyebrow: string;
  showEyebrow: boolean;
  country: string;
  city: string[];
  universitys: {
    id: string;
    name: string;
    image: string;
    location: string;
    courses: {
      id: string;
      name: string;
      tutionFees: string;
      duration: string;
      description: string;
      degreeLevelInfo: {
        id: string;
        degreeLevel: string;
        tutionFees: string;
        duration: string;
      }[];
      applyBtnParms: string[];
      applyBtnParmsDegreeLevel: string[];
    }[];
    description: string;
  }[];
}

export interface Section7Props {
  data?: Section7Data | string;
}

export const defaultDataSection7: Section7Data = {
  sectionUid: "section-uid-7",
  id: "section-uid-7",
  paddingX: 0,
  paddingY: 0,
  eyebrow: "NexaMart · NxMart",
  showEyebrow: true,
  country: "Bangladesh",
  city: [],
  universitys: [],
};
