/*
|-----------------------------------------
| setting up dashboard tutorial library page
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import { TutorialLibrary } from "@/components/dashboard-ui/TutorialLibrary";
import { dashboardTutorials } from "@/lib/dashboard/tutorials";

export default function DashboardTutorialPage() {
  return <TutorialLibrary tutorials={dashboardTutorials} />;
}
