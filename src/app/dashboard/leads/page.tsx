/*
|-----------------------------------------
| setting up the five Leads landing cards
| @author: Codex
|-----------------------------------------
*/

import Link from "next/link";

import { Icon } from "@/components/all-icons/all-icons";
import { leadTabs } from "@/lib/dashboard/leads";

export default function LeadsPage() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {leadTabs.map((tab) => (
        <div key={tab.path} className="custom-parent-border rounded-sm bg-white">
          <Link
            href={`/dashboard/leads/${tab.path}`}
            className="flex items-center gap-2 p-3 text-sm font-medium text-amber-900 transition duration-700 hover:bg-amber-50"
          >
            <Icon name={tab.icon} className="size-5" />
            {tab.label}
          </Link>
        </div>
      ))}
    </main>
  );
}
