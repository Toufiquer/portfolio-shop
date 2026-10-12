/*
|-----------------------------------------
| setting up Leads layout
| @author: Codex
|-----------------------------------------
*/

import type { ReactNode } from "react";

import Navigation from "./_components/Navigation";

export default function LeadsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto grid min-w-0 w-full max-w-7xl gap-5 p-3 text-stone-800 sm:p-5 lg:gap-6 lg:p-6"
      style={{ fontFamily: "var(--font-geist-sans, Arial), sans-serif" }}
    >
      <Navigation />
      {children}
    </div>
  );
}
