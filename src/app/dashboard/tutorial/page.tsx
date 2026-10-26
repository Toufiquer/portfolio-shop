/*
|-----------------------------------------
| setting up dashboard tutorial library page
| @author: Codex
|-----------------------------------------
*/

import { TutorialLibrary } from "@/components/dashboard-ui/TutorialLibrary";
import { dashboardTutorials } from "@/lib/dashboard/tutorials";

export default function DashboardTutorialPage() {
  return <TutorialLibrary tutorials={dashboardTutorials} />;
}
