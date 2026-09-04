/*
|-----------------------------------------
| setting up layout.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/app/api/lib/auth";
import MobileNavigation from "@/components/MobileNavigation";

import { DashboardNav } from "./dashboard-nav";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/login");

  if (requestHeaders.get("x-dashboard-authorization") === "denied") {
    const message = decodeURIComponent(requestHeaders.get("x-dashboard-authorization-message") ?? "Unauthorized.");
    return (
      <main className="grid min-h-[calc(100vh-65px)] flex-1 place-items-center bg-[#fffaf0] p-4 sm:p-8">
        <section className="w-full max-w-lg rounded-sm border border-red-200 bg-white p-6 text-center shadow-[0_20px_60px_-35px_rgba(120,53,15,.32)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-red-700">Unauthorized</p>
          <h1 className="mt-3 text-2xl font-semibold text-stone-900 sm:text-3xl">You cannot access this area</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {message} Ask an administrator to assign a role with the required permission.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-shell flex min-h-[calc(100vh-65px)] bg-[#fffaf0]">
      <DashboardNav />
      <div className="min-w-0 flex-1 pb-16 md:pb-0">{children}</div>
      <MobileNavigation dashboard />
    </div>
  );
}
