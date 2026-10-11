/*
|-----------------------------------------
| setting up the five Leads landing cards
| @author: Codex
|-----------------------------------------
*/

"use client";

import Link from "next/link";

import { Icon } from "@/components/all-icons/all-icons";
import { leadTabs } from "@/lib/dashboard/leads";
import { useDashboardPermissions } from "@/lib/dashboard/use-dashboard-permissions";

import { leadPanel, leadPresentation } from "./_components/presentation";

export default function LeadsPage() {
  const { canEnter } = useDashboardPermissions("/dashboard/leads");
  return (
    <main
      aria-label="Leads workspace sections"
      className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {leadTabs
        .filter((tab) => canEnter(`/dashboard/leads/${tab.path}`))
        .map((tab) => (
          <div key={tab.path} className={`${leadPanel} group border-t-3 ${leadPresentation[tab.path].accentClass}`}>
            <Link
              href={`/dashboard/leads/${tab.path}`}
              className="flex h-full min-h-60 flex-col items-start p-5 outline-none transition duration-300 hover:bg-[#fffdf7] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <span
                className={`mb-6 grid size-11 place-items-center rounded-sm border ${leadPresentation[tab.path].iconClass}`}
              >
                <Icon name={tab.icon} className="size-5" />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-stone-900">{tab.label}</h2>
              <p className="mt-2 mb-6 text-sm leading-6 text-stone-500">{leadPresentation[tab.path].description}</p>
              <span className="mt-auto flex w-full items-center justify-between gap-2 border-t border-[#f1eadc] pt-4 text-xs font-semibold text-amber-800">
                Open {tab.label.toLowerCase()}
                <Icon
                  name="ArrowRight"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </span>
            </Link>
          </div>
        ))}
    </main>
  );
}
