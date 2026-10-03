/*
|-----------------------------------------
| setting up legacy Business Growth customer route redirect
| @author: Codex
|-----------------------------------------
*/

import { redirect } from "next/navigation";

export default function LegacyBusinessGrowthCustomerPage() {
  redirect("/dashboard/business-growth");
}
