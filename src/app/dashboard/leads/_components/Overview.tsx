/*
|-----------------------------------------
| setting up Leads overview and monthly graphs
| @author: Codex
|-----------------------------------------
*/

"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/all-icons/all-icons";
import { toast } from "@/components/ui/global-toast";
import { useDashboardPermissions } from "@/lib/dashboard/use-dashboard-permissions";
import { useGetLeadsOverviewQuery } from "@/redux/features/dashboard/leads/leadsSlice";

import { leadPanel, leadPresentation } from "./presentation";
import {
  Action,
  EmptyState,
  errorMessage,
  LeadAvatar,
  LeadSelect,
  LeadsSkeleton,
  PageHeading,
  Pagination,
  useRefreshCooldown,
} from "./ui";

function ChartHeading({ title, description, icon }: { title: string; description?: string; icon: string }) {
  return (
    <div className="flex items-start gap-3 px-5 pt-5 pb-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-amber-100 bg-amber-50 text-amber-700">
        <Icon name={icon} className="size-4" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en", {
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Dhaka",
  });
function MonthlyChart({
  title,
  months,
  series,
}: {
  title: string;
  months: string[];
  series: { label: string; color: string; values: number[] }[];
}) {
  const [valuePage, setValuePage] = useState(1);
  const [valueSize, setValueSize] = useState(10);
  const max = Math.ceil(Math.max(4, ...series.flatMap((entry) => entry.values)) / 4) * 4;
  const width = 660,
    height = 220,
    left = 42,
    bottom = 30,
    top = 16;
  const plotWidth = width - left - 10,
    plotHeight = height - bottom - top;
  const step = plotWidth / Math.max(1, months.length);
  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 px-5 pb-3 text-[11px] text-slate-500">
        {series.map((entry) => (
          <span key={entry.label} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ background: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto px-3 pb-3">
        <svg aria-label={title} role="img" viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[480px]">
          <title>{title}</title>
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - 10}
                y1={top + (1 - fraction) * plotHeight}
                y2={top + (1 - fraction) * plotHeight}
                stroke="#f1eadc"
                strokeDasharray={fraction ? "4 4" : undefined}
              />
              <text
                x={left - 5}
                y={top + (1 - fraction) * plotHeight + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {Math.round(max * fraction).toLocaleString("en", { notation: "compact" })}
              </text>
            </g>
          ))}
          {months.map((month, index) => (
            <g key={month}>
              {series.map((entry, seriesIndex) => {
                const barWidth = Math.max(3, Math.min(24, (step - 12) / series.length)),
                  value = entry.values[index] ?? 0,
                  barHeight = (value / max) * plotHeight;
                return (
                  <rect
                    key={entry.label}
                    x={left + index * step + (step - barWidth * series.length) / 2 + seriesIndex * barWidth}
                    y={top + plotHeight - barHeight}
                    width={barWidth - 2}
                    height={barHeight}
                    fill={entry.color}
                    rx={2}
                    opacity={0.9}
                  >
                    <title>
                      {monthLabel(month)} · {entry.label}: {value}
                    </title>
                  </rect>
                );
              })}
              <text x={left + (index + 0.5) * step} y={height - 10} textAnchor="middle" fontSize="9" fill="#64748b">
                {monthLabel(month)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <details className="border-t border-[#eadfca] bg-[#fffdf7] px-5 py-3 text-xs text-slate-500">
        <summary className="cursor-pointer font-semibold hover:text-amber-800">View chart values</summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left [&_td]:py-2 [&_th]:py-2 [&_th]:font-medium">
            <thead>
              <tr>
                <th className="py-2">Month</th>
                {series.map((entry) => (
                  <th key={entry.label}>{entry.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.slice((valuePage - 1) * valueSize, valuePage * valueSize).map((month, index) => (
                <tr key={month} className="border-t border-[#eadfca]">
                  <td className="py-1">{monthLabel(month)}</td>
                  {series.map((entry) => (
                    <td key={entry.label}>{entry.values[(valuePage - 1) * valueSize + index] ?? 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {months.length > 10 && (
          <Pagination
            page={valuePage}
            total={months.length}
            pageSize={valueSize}
            onPage={setValuePage}
            onSize={(size) => {
              setValueSize(size);
              setValuePage(1);
            }}
          />
        )}
      </details>
    </div>
  );
}
function CouncilorProgressChart({
  rows,
}: {
  rows: { email: string; name: string; assigned: number; counselling24Hours: number; inactive: number }[];
}) {
  const metrics = [
    { key: "assigned", label: "Assigned", color: "bg-amber-500" },
    { key: "counselling24Hours", label: "Counselling · 24h", color: "bg-emerald-500" },
    { key: "inactive", label: "Inactive", color: "bg-rose-500" },
  ] as const;
  const maximums = Object.fromEntries(
    metrics.map(({ key }) => [key, Math.max(1, ...rows.map((row) => row[key]))]),
  ) as Record<(typeof metrics)[number]["key"], number>;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px] divide-y divide-[#eadfca]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#fffdf7] px-5 py-3 text-[11px] text-slate-500">
          {metrics.map((metric) => (
            <span key={metric.key} className="flex items-center gap-1.5">
              <span className={`inline-block size-2.5 rounded-sm ${metric.color}`} />
              {metric.label}
            </span>
          ))}
        </div>
        {rows.map((row) => (
          <figure key={row.email} className="grid grid-cols-[12rem_minmax(0,1fr)] gap-5 px-5 py-4">
            <figcaption className="flex min-w-0 items-center gap-3">
              <LeadAvatar name={row.name} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-700" title={row.name}>
                  {row.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500" title={row.email}>
                  {row.email}
                </p>
              </div>
            </figcaption>
            <div className="grid gap-2.5">
              {metrics.map((metric) => {
                const value = row[metric.key];
                const width = value ? Math.max(3, (value / maximums[metric.key]) * 100) : 0;
                return (
                  <div
                    key={metric.key}
                    className="grid grid-cols-[7.5rem_minmax(8rem,1fr)_2.5rem] items-center gap-3 text-xs"
                  >
                    <span className="truncate text-slate-500">{metric.label}</span>
                    <div
                      aria-label={`${row.name}: ${metric.label} ${value.toLocaleString()}`}
                      role="img"
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        className={`h-full rounded-full ${metric.color} transition-[width] duration-700 motion-reduce:transition-none`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <strong className="text-right font-semibold text-slate-700 tabular-nums">
                      {value.toLocaleString()}
                    </strong>
                  </div>
                );
              })}
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
export default function Overview() {
  const { can } = useDashboardPermissions("/dashboard/leads/overview");
  const { data, isLoading, isFetching, error, refetch } = useGetLeadsOverviewQuery(undefined, { skip: !can("read") });
  const cooldown = useRefreshCooldown();
  const [progressPage, setProgressPage] = useState(1),
    [progressSize, setProgressSize] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [funnelPage, setFunnelPage] = useState(1),
    [funnelSize, setFunnelSize] = useState(10);
  const month = data?.months.find((item) => item.month === selectedMonth) ?? data?.months[data.months.length - 1];
  const months = data?.months.map((item) => item.month) ?? [];
  const progress = data?.progress ?? [];
  const actualProgressPage = Math.min(progressPage, Math.max(1, Math.ceil(progress.length / progressSize)));
  const actualFunnelPage = Math.min(funnelPage, Math.max(1, Math.ceil((month?.funnels.length ?? 0) / funnelSize)));
  const panel = leadPanel;
  async function refresh() {
    cooldown.start();
    try {
      await refetch().unwrap();
      toast.success("Overview refreshed.");
    } catch (failure) {
      toast.error(errorMessage(failure));
    }
  }
  return (
    <section className="grid min-w-0 gap-5">
      <PageHeading title="Leads overview" icon="BarChart" iconClass={leadPresentation.overview.iconClass}>
        <Action disabled={!can("read") || isFetching || Boolean(cooldown.remaining)} onClick={refresh}>
          <Icon name="RefreshCw" className={isFetching ? "animate-spin" : ""} />
          {cooldown.remaining ? `Refresh (${cooldown.remaining}s)` : "Refresh"}
        </Action>
      </PageHeading>
      {!can("read") ? (
        <div className={panel}>
          <EmptyState
            icon="Lock"
            title="Read access required"
            description="Read permission is required to display the overview."
          />
        </div>
      ) : error ? (
        <div className={panel} role="alert">
          <EmptyState icon="AlertCircle" title="Could not load overview" description={errorMessage(error)} />
        </div>
      ) : isLoading || !data ? (
        <LeadsSkeleton />
      ) : (
        <>
          <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "All customers",
                value: data.summary.all,
                icon: "Users",
                color: "border-sky-100 bg-sky-50 text-sky-700",
              },
              {
                label: "New in 30 days",
                value: data.summary.new30Days,
                icon: "TrendingUp",
                color: "border-amber-100 bg-amber-50 text-amber-700",
              },
              {
                label: "Active customers",
                value: data.summary.active,
                icon: "Activity",
                color: "border-emerald-100 bg-emerald-50 text-emerald-700",
              },
              {
                label: "Inactive customers",
                value: data.summary.inactive,
                icon: "Clock",
                color: "border-stone-200 bg-stone-50 text-stone-500",
              },
            ].map((card) => (
              <div key={card.label} className={`${panel} group relative overflow-hidden p-5`}>
                <span aria-hidden="true" className="absolute -right-5 -bottom-6 size-20 rounded-full bg-amber-50" />
                <div className="flex items-center justify-between gap-2">
                  <span className="relative text-xs font-semibold text-slate-500">{card.label}</span>
                  <span className={`relative grid size-10 shrink-0 place-items-center rounded-sm border ${card.color}`}>
                    <Icon name={card.icon} className="size-4" />
                  </span>
                </div>
                <p className="relative mt-3 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                  {card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </section>
          <section aria-label="Overview navigation" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Funnels", path: "funnels", icon: "Filter", count: data.counts.funnels },
              { label: "Customers", path: "customers", icon: "Users", count: data.counts.customers },
              { label: "Councilors", path: "councilors", icon: "User", count: data.counts.councilors },
              { label: "My Leads", path: "my-leads", icon: "FileText", count: data.counts.mine },
            ].map((card) => (
              <Link
                key={card.path}
                href={`/dashboard/leads/${card.path}`}
                className="group flex items-center gap-3 rounded-sm border border-[#eadfca] bg-white px-4 py-3 text-sm outline-none transition duration-700 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/60 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 motion-reduce:transition-none"
              >
                <Icon name={card.icon} className="size-4 shrink-0 text-amber-700" />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                  {card.label}{" "}
                  <strong className="text-sm text-slate-900 tabular-nums">{card.count.toLocaleString()}</strong>
                </span>
                <Icon
                  name="ChevronRight"
                  className="size-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </section>
          <section className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eadfca] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Councilor progress</h2>
              </div>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                Team activity
              </span>
            </div>
            <div className="grid gap-4 border-b border-[#eadfca] bg-[#fffdf7] p-5 sm:grid-cols-3">
              {[
                { label: "Total assigned customers", value: progress.reduce((sum, row) => sum + row.assigned, 0) },
                {
                  label: "Counselling sessions · last 24 hours",
                  value: progress.reduce((sum, row) => sum + row.counselling24Hours, 0),
                },
                {
                  label: "Total inactive assigned customers",
                  value: progress.reduce((sum, row) => sum + row.inactive, 0),
                },
              ].map((card) => (
                <div key={card.label} className="border-l-2 border-amber-300 pl-3">
                  <p className="text-[11px] leading-5 text-slate-500">{card.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-b border-[#eadfca]">
              {progress.length ? (
                <CouncilorProgressChart
                  rows={progress.slice((actualProgressPage - 1) * progressSize, actualProgressPage * progressSize)}
                />
              ) : (
                <EmptyState
                  icon="Users"
                  title="Your team activity starts here"
                  description="Add a councilor and assign customers to see progress."
                />
              )}
            </div>
            <Pagination
              page={actualProgressPage}
              total={progress.length}
              pageSize={progressSize}
              onPage={setProgressPage}
              onSize={(size) => {
                setProgressSize(size);
                setProgressPage(1);
              }}
            />
          </section>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className={panel}>
              <ChartHeading title="Customer growth" icon="TrendingUp" />
              <MonthlyChart
                title="New customers per month"
                months={months}
                series={[
                  { label: "New customers", color: "#d97706", values: data.months.map((item) => item.customers) },
                ]}
              />
            </section>
            <section className={panel}>
              <ChartHeading title="Business facts" icon="BarChart" />
              <MonthlyChart
                title="Monthly customer and counselling activity"
                months={months}
                series={[
                  { label: "New customers", color: "#d97706", values: data.months.map((item) => item.customers) },
                  { label: "Assignments", color: "#059669", values: data.months.map((item) => item.assignments) },
                  {
                    label: "Counselling sessions",
                    color: "#0284c7",
                    values: data.months.map((item) => item.counselling),
                  },
                ]}
              />
            </section>
            <section className={panel}>
              <ChartHeading title="Customer distribution" icon="PieChart" />
              <MonthlyChart
                title="Active and inactive customers by creation month"
                months={months}
                series={[
                  { label: "Active", color: "#059669", values: data.months.map((item) => item.active) },
                  { label: "Inactive", color: "#e11d48", values: data.months.map((item) => item.inactive) },
                ]}
              />
            </section>
            <section className={panel}>
              <div className="flex flex-wrap items-start justify-between gap-2 px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-sm border border-violet-100 bg-violet-50 text-violet-700">
                    <Icon name="Filter" className="size-4" />
                  </span>
                  <h2 className="text-sm font-semibold text-slate-900">Customers by funnels</h2>
                </div>
                <LeadSelect
                  label="Choose month"
                  value={month?.month ?? ""}
                  options={data.months.map((item) => ({ value: item.month, label: monthLabel(item.month) }))}
                  onChange={(value) => {
                    setSelectedMonth(value);
                    setFunnelPage(1);
                  }}
                />
              </div>
              <div className="grid gap-4 p-5">
                {month?.funnels
                  .slice((actualFunnelPage - 1) * funnelSize, actualFunnelPage * funnelSize)
                  .map((funnel, index) => (
                    <div key={`${funnel.name}-${index}`} className="grid gap-2 text-xs">
                      <div className="flex min-w-0 justify-between gap-2">
                        <span className="truncate font-medium text-slate-600" title={funnel.name}>
                          {funnel.name}
                        </span>
                        <strong className="text-violet-700 tabular-nums">{funnel.count.toLocaleString()}</strong>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-violet-50">
                        <div
                          aria-label={`${funnel.name}: ${funnel.count} customers`}
                          role="img"
                          className="h-full rounded-full bg-linear-to-r from-violet-400 to-amber-500 transition-all duration-700 motion-reduce:transition-none"
                          style={{
                            width: `${(funnel.count / Math.max(1, ...(month?.funnels.map((item) => item.count) ?? []))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                {!month?.funnels.length && (
                  <EmptyState
                    icon="Filter"
                    title="No funnel activity yet"
                    description="Customers added in the selected month will appear here."
                  />
                )}
              </div>
              <Pagination
                page={actualFunnelPage}
                total={month?.funnels.length ?? 0}
                pageSize={funnelSize}
                onPage={setFunnelPage}
                onSize={(size) => {
                  setFunnelSize(size);
                  setFunnelPage(1);
                }}
              />
            </section>
          </div>
        </>
      )}
      {isFetching && !isLoading && (
        <p role="status" className="flex items-center gap-2 text-xs text-amber-800">
          <Icon name="RefreshCw" className="size-3 animate-spin" />
          Refreshing overview…
        </p>
      )}
    </section>
  );
}
