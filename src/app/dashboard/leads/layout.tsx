/*
|-----------------------------------------
| setting up Leads layout
| @author: Codex
|-----------------------------------------
*/

import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/app/api/lib/auth";
import { getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";

import Navigation from "./_components/Navigation";

export default async function LeadsLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const access = await getDashboardAccessState(session);
  const role = access.roleName ?? (access.bypassed ? "Unrestricted" : "Unassigned");

  return (
    <div
      className="mx-auto grid min-w-0 w-full max-w-7xl gap-5 p-3 text-stone-800 sm:p-5 lg:gap-6 lg:p-6"
      style={{ fontFamily: "var(--font-geist-sans, Arial), sans-serif" }}
    >
      <aside
        aria-label="Signed-in account"
        className="ml-auto rounded-sm border border-[#eadfca] bg-white px-3 py-2 text-xs shadow-[0_2px_8px_rgba(120,80,30,0.035)]"
      >
        <span
          className="inline-block max-w-[min(55vw,20rem)] truncate rounded-sm bg-amber-50 px-2 py-1 font-semibold text-amber-800"
          title={session.user.email ?? "Email unavailable"}
        >
          {role}
        </span>
      </aside>
      <Navigation />
      {children}
    </div>
  );
}
