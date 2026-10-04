/*
|-----------------------------------------
| setting up legacy Business Growth route redirects
| @author: Codex
|-----------------------------------------
*/

import { notFound, redirect } from "next/navigation";

const legacySections: Record<string, string> = {
  overview: "/dashboard/business-growth/overview",
  funnels: "/dashboard/business-growth/funnels",
  customer: "/dashboard/business-growth/customer",
  councillor: "/dashboard/business-growth/councillor",
  task: "/dashboard/business-growth/my-customer",
  "my-customer": "/dashboard/business-growth/my-customer",
};

export default async function LegacyBusinessGrowthPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  if (!slug.length) redirect("/dashboard/business-growth");
  if (slug.length !== 1 || !legacySections[slug[0]]) notFound();
  redirect(legacySections[slug[0]]);
}
