/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Codex
|-----------------------------------------
*/

"use client";

import { ArrowUpRight, BarChart3, FolderTree, Layers3, PanelLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { authClient } from "@/app/api/lib/auth-client";
import { iconMap } from "@/components/all-icons/all-icons";
import { LoadingState } from "@/components/ui/loading-state";
import { useGetSidebarsQuery } from "@/redux/features/dashboard/sidebars/sidebarSlice";
import { type SidebarItem } from "@/redux/features/dashboard/types";

const colors = ["#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#f43f5e", "#14b8a6", "#f97316"];
type Group = { item: SidebarItem; children: SidebarItem[]; color: string };

function groupItems(items: SidebarItem[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const children = new Map<string, SidebarItem[]>();
  items.forEach((item) => {
    if (item.parentId) children.set(item.parentId, [...(children.get(item.parentId) ?? []), item]);
  });
  return items
    .filter((item) => !item.parentId || !byId.has(item.parentId))
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
    .map((item, index) => ({
      item,
      children: (children.get(item.id) ?? []).sort((a, b) => a.position - b.position || a.name.localeCompare(b.name)),
      color: colors[index % colors.length],
    }));
}

export default function DashboardHomePage() {
  const { data: session, isPending } = authClient.useSession();
  const { data, isLoading, isError } = useGetSidebarsQuery(undefined, { skip: !session });
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const groups = useMemo(() => groupItems(items), [items]);
  const childCount = items.filter((item) => item.parentId).length;
  const largest = groups.reduce<Group | null>(
    (current, group) => (!current || group.children.length > current.children.length ? group : current),
    null,
  );
  const max = Math.max(...groups.map((group) => group.children.length + 1), 1);
  const pieStops = groups.reduce(
    (chart, group) => {
      const end = chart.offset + ((group.children.length + 1) / Math.max(items.length, 1)) * 100;
      return { offset: end, stops: [...chart.stops, `${group.color} ${chart.offset}% ${end}%`] };
    },
    { offset: 0, stops: [] as string[] },
  ).stops;

  if (isPending || isLoading) return <LoadingState label="Loading dashboard summary" />;
  if (isError) return <DashboardError />;

  return (
    <main className="min-h-[calc(100vh-65px)] flex-1 overflow-hidden bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-sm border border-[#eadfca] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl animate-[soft-pulse_4s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl animate-[soft-pulse_5s_ease-in-out_infinite]" />
          <div className="relative max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-sm bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[.16em] text-amber-900">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard overview
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Your workspace, at a glance.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              This summary is generated from the sidebar areas available to your role. Explore your available tools and
              continue where you left off.
            </p>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={PanelLeft} label="Visible sidebar items" value={items.length} color="amber" />
          <Metric icon={FolderTree} label="Top-level areas" value={groups.length} color="sky" />
          <Metric icon={Layers3} label="Nested tools" value={childCount} color="emerald" />
          <Metric icon={BarChart3} label="Largest workspace" value={largest?.item.name ?? "—"} color="violet" />
        </section>

        {!items.length ? (
          <EmptyState />
        ) : (
          <>
            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,.8fr)]">
              <section className="rounded-sm border border-[#eadfca] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900">Sidebar distribution</h2>
                    <p className="mt-1 text-sm text-stone-600">Tools available in each workspace.</p>
                  </div>
                  <span className="rounded-sm bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                    {items.length} items
                  </span>
                </div>
                <div className="mt-8 flex h-60 items-end gap-3 border-b border-l border-[#eadfca] px-3 pt-4 sm:gap-5">
                  {groups.map((group) => {
                    const count = group.children.length + 1;
                    const icon = iconMap[group.item.icon] ?? <PanelLeft className="h-4 w-4" />;
                    return (
                      <Link
                        className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                        href={group.item.url || "/dashboard"}
                        key={group.item.id}
                        title={`${group.item.name}: ${count} sidebar items`}
                      >
                        <span className="text-xs font-semibold text-stone-700">{count}</span>
                        <span
                          className="w-full max-w-14 rounded-t-sm shadow-[0_-8px_24px_-12px_rgba(120,53,15,.55)] transition-all duration-700 ease-out group-hover:brightness-110"
                          style={{ backgroundColor: group.color, height: `${Math.max(10, (count / max) * 100)}%` }}
                        />
                        <span className="grid h-7 w-7 place-items-center text-stone-600">{icon}</span>
                        <span className="w-full truncate text-center text-[11px] font-medium text-stone-600">
                          {group.item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
              <section className="rounded-sm border border-[#eadfca] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-stone-900">Navigation mix</h2>
                <p className="mt-1 text-sm text-stone-600">A visual split of all visible sidebar items.</p>
                <div className="mt-6 grid items-center gap-6 sm:grid-cols-[10rem_1fr] xl:grid-cols-1 2xl:grid-cols-[10rem_1fr]">
                  <div
                    aria-label="Sidebar item distribution pie chart"
                    className="relative mx-auto grid h-40 w-40 place-items-center rounded-full shadow-[0_14px_38px_-22px_rgba(120,53,15,.6)]"
                    style={{ background: `conic-gradient(${pieStops.join(", ")})` }}
                  >
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner">
                      <span className="text-xs text-stone-500">Available</span>
                      <span className="text-2xl font-semibold text-stone-900">{items.length}</span>
                      <span className="text-[11px] text-stone-500">sidebar items</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {groups.map((group) => (
                      <div className="flex items-center justify-between gap-3 text-sm" key={group.item.id}>
                        <span className="flex min-w-0 items-center gap-2 text-stone-700">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="truncate">{group.item.name}</span>
                        </span>
                        <span className="shrink-0 font-medium text-stone-900">{group.children.length + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </section>
            <section className="mt-6">
              <h2 className="text-xl font-semibold text-stone-900">Your sidebar areas</h2>
              <p className="mt-1 text-sm text-stone-600">Every visible workspace and its available tools.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {groups.map((group) => {
                  const icon = iconMap[group.item.icon] ?? <PanelLeft className="h-5 w-5" />;
                  return (
                    <article
                      className="group rounded-sm border border-[#eadfca] bg-white p-5 shadow-sm transition duration-700 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_18px_38px_-28px_rgba(120,53,15,.55)]"
                      key={group.item.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className="grid h-10 w-10 place-items-center rounded-sm text-white"
                          style={{ backgroundColor: group.color }}
                        >
                          {icon}
                        </span>
                        <span className="rounded-sm bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
                          {group.children.length} tool{group.children.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <h3 className="mt-4 font-semibold text-stone-900">{group.item.name}</h3>
                      <p className="mt-1 truncate text-sm text-stone-600">{group.item.url}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {group.children.length ? (
                          group.children.map((child) => (
                            <Link
                              className="rounded-sm bg-[#fffaf0] px-2.5 py-1.5 text-xs font-medium text-stone-700 transition duration-700 hover:bg-amber-100 hover:text-amber-900"
                              href={child.url || "/dashboard"}
                              key={child.id}
                            >
                              {child.name}
                            </Link>
                          ))
                        ) : (
                          <Link className="secondary-button mt-1" href={group.item.url || "/dashboard"}>
                            Open area <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof PanelLeft;
  label: string;
  value: string | number;
  color: "amber" | "sky" | "emerald" | "violet";
}) {
  const styles = {
    amber: "bg-amber-100 text-amber-800",
    sky: "bg-sky-100 text-sky-800",
    emerald: "bg-emerald-100 text-emerald-800",
    violet: "bg-violet-100 text-violet-800",
  };
  return (
    <div className="rounded-sm border border-[#eadfca] bg-white p-5 shadow-sm transition duration-700 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-28px_rgba(120,53,15,.45)]">
      <span className={`grid h-9 w-9 place-items-center rounded-sm ${styles[color]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="mt-1 text-sm text-stone-600">{label}</p>
    </div>
  );
}
function EmptyState() {
  return (
    <section className="mt-6 rounded-sm border border-dashed border-amber-300 bg-amber-50 p-10 text-center">
      <PanelLeft className="mx-auto h-8 w-8 text-amber-700" />
      <h2 className="mt-3 font-semibold text-stone-900">No sidebar areas are available yet</h2>
      <p className="mt-1 text-sm text-stone-600">Ask an administrator to assign the dashboard permissions you need.</p>
    </section>
  );
}
function DashboardError() {
  return (
    <main className="grid min-h-[calc(100vh-65px)] flex-1 place-items-center bg-[#fffaf0] p-6">
      <section className="w-full max-w-lg rounded-sm border border-red-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Could not load your dashboard summary</h1>
        <p className="mt-2 text-sm text-stone-600">Please refresh the page and try again.</p>
      </section>
    </main>
  );
}
