/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface Section6Data {
  sectionUid: string;
  id: string;
  paddingX: number;
  paddingY: number;
  showEyebrow?: boolean;
  universityName: string;
  location: string;
  established: string;
  description: string;
  bannerImage: string;
  logoUrl: string;
  programs: string[];
  subjects: string[];
  tuitionFee: string;
  rating: string;
  totalStudents: string;
  accreditation: string;
  websiteUrl: string;
  applyText: string;
  buttonText: string;
  buttonUrl: string;
  features: string[];
}

export const defaultDataSection6: Section6Data = {
  sectionUid: "section-uid-6",
  id: "section-uid-6",
  paddingX: 0,
  paddingY: 0,
  showEyebrow: true,
  universityName: "",
  location: "",
  established: "",
  description: "Online shopping across Bangladesh.",
  bannerImage: "/Logo.png",
  logoUrl: "/Logo.png",
  programs: [],
  subjects: [],
  tuitionFee: "",
  rating: "",
  totalStudents: "",
  accreditation: "",
  websiteUrl: "/products",
  buttonText: "Browse products",
  buttonUrl: "/products",
  applyText: "Browse products",
  features: [],
};
