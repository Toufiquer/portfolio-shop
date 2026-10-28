/*
|-----------------------------------------
| setting up dashboard academy tutorial data
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export type TutorialItem = {
  tag: string;
  sidebar_url?: string;
  yt_url: string;
  children?: TutorialItem[];
};

export const dashboardTutorials: TutorialItem[] = [
  {
    tag: "Full Overview",
    sidebar_url: "/dashboard",
    yt_url: "https://www.youtube.com/watch?v=_hWK7TVM2ro",
  },
  {
    tag: "Developer",
    sidebar_url: "/dashboard/developer",
    yt_url: "https://youtu.be/_hWK7TVM2ro",
  },
  {
    tag: "Admin",
    sidebar_url: "/dashboard/admin",
    yt_url: "https://www.youtube.com/live/_hWK7TVM2ro",
  },
  {
    tag: "Others",
    sidebar_url: "/dashboard/",
    yt_url: "https://www.youtube.com/live/_hWK7TVM2ro",
  },
];
