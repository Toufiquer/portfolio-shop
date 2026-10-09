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
    <div className="grid min-w-0 w-full gap-3">
      <Navigation />
      {children}
    </div>
  );
}
