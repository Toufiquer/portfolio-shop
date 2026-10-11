/*
|-----------------------------------------
| setting up route-backed Leads navigation
| @author: Codex
|-----------------------------------------
*/

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { Icon } from "@/components/all-icons/all-icons";
import { leadTabs } from "@/lib/dashboard/leads";
import { useDashboardPermissions } from "@/lib/dashboard/use-dashboard-permissions";

import { leadPanel } from "./presentation";

export default function Navigation() {
  const pathname = usePathname();
  const { canEnter, data: permissions } = useDashboardPermissions("/dashboard/leads");
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const isHome = pathname === "/dashboard/leads";
  const current = leadTabs.find((tab) => pathname === `/dashboard/leads/${tab.path}`);
  useEffect(() => {
    const nav = navRef.current;
    const active = activeRef.current;
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft +=
      active.getBoundingClientRect().left -
      nav.getBoundingClientRect().left -
      (nav.clientWidth - active.clientWidth) / 2;
  }, [pathname, permissions]);
  return (
    <div className="grid min-w-0 gap-4">
      {isHome ? (
        <header
          className={`${leadPanel} relative overflow-hidden bg-linear-to-br from-white via-[#fffdf7] to-amber-50 p-6 sm:p-8`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 size-52 rounded-full border-28 border-amber-100/60"
          />
          <div className="relative max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
              <Icon name="FolderKanban" className="size-4" />
              Customer management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Leads workspace</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
              From the first conversation to the next opportunity. Choose a workspace to manage your pipeline, your
              team, and your customer relationships.
            </p>
          </div>
        </header>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-2 text-xs text-stone-500">
            <Link
              href="/dashboard/leads"
              className="flex items-center gap-1.5 rounded-sm font-medium text-stone-500 outline-none transition hover:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Icon name="FolderKanban" className="size-4" />
              Leads workspace
            </Link>
            <Icon name="ChevronRight" className="size-3 shrink-0" />
            <span className="truncate text-stone-700">{current?.label}</span>
          </div>
          <nav
            ref={navRef}
            aria-label="Leads tabs"
            className={`${leadPanel} flex min-w-0 gap-1 overflow-x-auto p-1.5 sm:grid sm:grid-cols-5`}
          >
            {leadTabs
              .filter((tab) => canEnter(`/dashboard/leads/${tab.path}`))
              .map((tab) => {
                const href = `/dashboard/leads/${tab.path}`;
                return (
                  <Link
                    key={tab.path}
                    ref={pathname === href ? activeRef : undefined}
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className={`flex shrink-0 items-center justify-center gap-2 rounded-sm border px-3 py-3 text-sm font-medium outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-amber-500 motion-reduce:transition-none sm:min-w-0 ${pathname === href ? "border-amber-200 bg-amber-50 text-amber-950 shadow-xs" : "border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-900"}`}
                  >
                    <Icon name={tab.icon} className="size-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </Link>
                );
              })}
          </nav>
        </>
      )}
    </div>
  );
}
