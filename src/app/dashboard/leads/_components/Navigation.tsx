/*
|-----------------------------------------
| setting up route-backed Leads navigation
| @author: Codex
|-----------------------------------------
*/

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/all-icons/all-icons";
import { leadTabs } from "@/lib/dashboard/leads";

export default function Navigation() {
  const pathname = usePathname();
  if (pathname === "/dashboard/leads") return null;
  return (
    <nav
      aria-label="Leads tabs"
      className="mx-auto grid min-w-0 w-full max-w-7xl grid-cols-2 gap-1 rounded-sm border border-[#eadfca] bg-white p-1 sm:grid-cols-5"
    >
      {leadTabs.map((tab) => {
        const href = `/dashboard/leads/${tab.path}`;
        return (
          <Link
            key={tab.path}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-sm p-2 text-sm transition duration-700 hover:bg-amber-100 ${pathname === href ? "bg-amber-100 text-amber-950" : "text-stone-600"}`}
          >
            <Icon name={tab.icon} className="size-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
