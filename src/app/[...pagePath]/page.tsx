/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August, 2026
|-----------------------------------------
*/

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageBlocks } from "@/components/pages/PageBlocks";
import { getPublishedPage, normalizePagePath } from "@/lib/pages/server";

async function find(params: Promise<{ pagePath: string[] }>) {
  const { pagePath } = await params;
  return getPublishedPage(normalizePagePath(`/${pagePath.join("/")}`));
}
export async function generateMetadata({ params }: { params: Promise<{ pagePath: string[] }> }): Promise<Metadata> {
  const page = await find(params);
  return page ? { title: page.title, description: page.description } : { title: "Not found" };
}
export default async function DynamicPage({ params }: { params: Promise<{ pagePath: string[] }> }) {
  const page = await find(params);
  if (!page) notFound();
  return (
    <main className="flex-1 ">
      <PageBlocks blocks={page.blocks} pageId={page.id} />
    </main>
  );
}
