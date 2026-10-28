/*
|-----------------------------------------
| setting up grouped import data controls
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import type { ReactNode } from "react";

import { iconMap } from "@/components/all-icons/all-icons";

import ImportSkeleton from "./ImportSkeleton";

export default function ImportGroup({
  children,
  complete,
  count,
  loading,
  title,
}: {
  children: ReactNode;
  complete: boolean;
  count: number;
  loading: boolean;
  title: string;
}) {
  return (
    <section className="rounded-sm border border-[#eadfca] bg-[#fffaf0] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-stone-900">{title}</h2>
          <p className="mt-0.5 text-xs text-stone-500">{loading ? "Checking…" : `${count} saved`}</p>
        </div>
        <span
          aria-label={complete ? `${title} selected items are saved` : `${title} has pending items`}
          className={complete ? "text-emerald-700" : "text-amber-700"}
        >
          {complete ? iconMap.Check : iconMap.RefreshCw}
        </span>
      </div>
      <div className="grid gap-2">{loading ? <ImportSkeleton compact /> : children}</div>
    </section>
  );
}
