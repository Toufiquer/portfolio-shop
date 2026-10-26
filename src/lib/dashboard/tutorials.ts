/*
|-----------------------------------------
| setting up dashboard academy tutorial data
| @author: Codex
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
    tag: "Dashboard overview",
    sidebar_url: "/dashboard",
    yt_url: "https://www.youtube.com/watch?v=_hWK7TVM2ro",
  },
  {
    tag: "Developer workspace",
    sidebar_url: "/dashboard/developer",
    yt_url: "https://youtu.be/_hWK7TVM2ro",
    children: [
      {
        tag: "Manage your sidebar",
        sidebar_url: "/dashboard/developer/sidebar",
        yt_url: "https://www.youtube.com/embed/_hWK7TVM2ro",
      },
      {
        tag: "Review user sessions",
        sidebar_url: "/dashboard/developer/session",
        yt_url: "https://www.youtube.com/shorts/_hWK7TVM2ro",
      },
    ],
  },
  {
    tag: "Administration",
    sidebar_url: "/dashboard/admin",
    yt_url: "https://www.youtube.com/live/_hWK7TVM2ro",
    children: [
      {
        tag: "Manage team users",
        sidebar_url: "/dashboard/admin/users",
        yt_url: "https://www.youtube.com/watch?v=_hWK7TVM2ro&feature=share",
      },
      {
        tag: "Build and publish pages",
        sidebar_url: "/dashboard/admin/pages",
        yt_url: "https://youtu.be/_hWK7TVM2ro?t=1",
      },
    ],
  },
];
