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
import { useGetLeadsOverviewQuery } from "@/redux/features/dashboard/leads/leadsSlice";

import { Action, errorMessage, LeadSelect, LeadsSkeleton, Pagination, useRefreshCooldown } from "./ui";

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
  const max = Math.max(1, ...series.flatMap((entry) => entry.values));
  const width = 660,
    height = 220,
    left = 35,
    bottom = 30,
    top = 12;
  const plotWidth = width - left - 10,
    plotHeight = height - bottom - top;
  const step = plotWidth / Math.max(1, months.length);
  return (
    <div>
      <div className="flex flex-wrap gap-3 px-3 text-xs text-stone-500">
        {series.map((entry) => (
          <span key={entry.label} className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm" style={{ background: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg aria-label={title} role="img" viewBox={`0 0 ${width} ${height}`} className="min-w-[480px] w-full">
          <title>{title}</title>
          {[0, 0.5, 1].map((fraction) => (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - 10}
                y1={top + (1 - fraction) * plotHeight}
                y2={top + (1 - fraction) * plotHeight}
                stroke="#eadfca"
              />
              <text
                x={left - 5}
                y={top + (1 - fraction) * plotHeight + 4}
                textAnchor="end"
                fontSize="10"
                fill="#78716c"
              >
                {Math.round(max * fraction)}
              </text>
            </g>
          ))}
          {months.map((month, index) => (
            <g key={month}>
              {series.map((entry, seriesIndex) => {
                const barWidth = Math.max(2, (step - 8) / series.length),
                  value = entry.values[index] ?? 0,
                  barHeight = (value / max) * plotHeight;
                return (
                  <rect
                    key={entry.label}
                    x={left + index * step + 4 + seriesIndex * barWidth}
                    y={top + plotHeight - barHeight}
                    width={barWidth - 1}
                    height={barHeight}
                    fill={entry.color}
                    rx={1}
                  >
                    <title>
                      {monthLabel(month)} · {entry.label}: {value}
                    </title>
                  </rect>
                );
              })}
              <text x={left + (index + 0.5) * step} y={height - 10} textAnchor="middle" fontSize="9" fill="#78716c">
                {monthLabel(month)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <details className="border-t border-[#eadfca] p-3 text-xs">
        <summary className="cursor-pointer">View chart values</summary>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
                <tr key={month}>
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
export default function Overview() {
  const { data, isLoading, isFetching, error, refetch } = useGetLeadsOverviewQuery();
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
  const panel = "min-w-0 rounded-sm border border-[#eadfca] bg-white";
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
    <section className="custom-parent-border mx-auto grid min-w-0 w-full max-w-7xl gap-3 rounded-sm bg-[#fffdf7] p-3 text-stone-800">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Leads overview</h1>
          <p className="text-sm text-stone-500">Customer relationships and councilor activity · Asia/Dhaka</p>
        </div>
        <Action disabled={isFetching || Boolean(cooldown.remaining)} onClick={refresh}>
          <Icon name="RefreshCw" className={isFetching ? "animate-spin" : ""} />
          {cooldown.remaining ? `Refresh (${cooldown.remaining}s)` : "Refresh"}
        </Action>
      </header>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage(error)}
        </p>
      ) : isLoading || !data ? (
        <LeadsSkeleton />
      ) : (
        <>
          <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "All customers", value: data.summary.all, icon: "Users" },
              { label: "New in 30 days", value: data.summary.new30Days, icon: "Calendar" },
              { label: "Active customers", value: data.summary.active, icon: "Activity" },
              { label: "Inactive customers", value: data.summary.inactive, icon: "Clock" },
            ].map((card) => (
              <div key={card.label} className={`${panel} p-3`}>
                <div className="flex items-center justify-between gap-2 text-sm text-stone-500">
                  <span>{card.label}</span>
                  <Icon name={card.icon} className="size-4 text-amber-600" />
                </div>
                <p className="text-3xl font-semibold">{card.value.toLocaleString()}</p>
              </div>
            ))}
          </section>
          <section aria-label="Overview navigation" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Funnels", path: "funnels", count: data.counts.funnels },
              { label: "Customers", path: "customers", count: data.counts.customers },
              { label: "Councilors", path: "councilors", count: data.counts.councilors },
              { label: "My Customers", path: "my-leads", count: data.counts.mine },
            ].map((card) => (
              <Link
                key={card.path}
                href={`/dashboard/leads/${card.path}`}
                className={`${panel} flex items-center justify-between gap-2 p-3 text-sm transition duration-700 hover:bg-amber-50`}
              >
                <span>
                  {card.label} <strong>{card.count.toLocaleString()}</strong>
                </span>
                <Icon name="ArrowRight" className="size-4 text-amber-700" />
              </Link>
            ))}
          </section>
          <section className={panel}>
            <h2 className="border-b border-[#eadfca] p-3 font-semibold">Councilor progress</h2>
            <div className="grid gap-2 border-b border-[#eadfca] p-3 sm:grid-cols-3">
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
                <div key={card.label}>
                  <p className="text-xs text-stone-500">{card.label}</p>
                  <p className="text-xl font-semibold">{card.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-amber-50 text-xs text-stone-500">
                  <tr>
                    <th className="p-3">Councilor</th>
                    <th className="p-3">Assigned</th>
                    <th className="p-3">Counselling · last 24h</th>
                    <th className="p-3">Inactive</th>
                  </tr>
                </thead>
                <tbody>
                  {progress
                    .slice((actualProgressPage - 1) * progressSize, actualProgressPage * progressSize)
                    .map((row) => (
                      <tr key={row.email} className="border-t border-[#eadfca]">
                        <td className="max-w-56 truncate p-3" title={`${row.name} · ${row.email}`}>
                          {row.name}
                        </td>
                        <td className="p-3">{row.assigned}</td>
                        <td className="p-3">{row.counselling24Hours}</td>
                        <td className="p-3">{row.inactive}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!progress.length && (
                <p className="p-3 text-sm text-stone-500">Add a councilor and assign customers to see progress.</p>
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
          <div className="grid gap-3 lg:grid-cols-2">
            <section className={panel}>
              <h2 className="p-3 font-semibold">Customer growth</h2>
              <MonthlyChart
                title="New customers per month"
                months={months}
                series={[
                  { label: "New customers", color: "#d97706", values: data.months.map((item) => item.customers) },
                ]}
              />
            </section>
            <section className={panel}>
              <h2 className="p-3 font-semibold">Business facts</h2>
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
              <h2 className="p-3 font-semibold">Customer distribution</h2>
              <p className="px-3 pb-2 text-xs text-stone-500">Current status of customers added in each month.</p>
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
              <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                <h2 className="font-semibold">Customers by funnels</h2>
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
              <p className="px-3 pb-3 text-xs text-stone-500">
                Current funnel of customers added in {month ? monthLabel(month.month) : "this month"}.
              </p>
              <div className="grid gap-3 p-3">
                {month?.funnels
                  .slice((actualFunnelPage - 1) * funnelSize, actualFunnelPage * funnelSize)
                  .map((funnel, index) => (
                    <div key={`${funnel.name}-${index}`} className="grid gap-1 text-sm">
                      <div className="flex min-w-0 justify-between gap-2">
                        <span className="truncate" title={funnel.name}>
                          {funnel.name}
                        </span>
                        <strong>{funnel.count}</strong>
                      </div>
                      <div className="h-3 overflow-hidden rounded-sm bg-amber-50">
                        <div
                          aria-label={`${funnel.name}: ${funnel.count} customers`}
                          role="img"
                          className="h-full bg-amber-400 transition-all duration-700"
                          style={{
                            width: `${(funnel.count / Math.max(1, ...(month?.funnels.map((item) => item.count) ?? []))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                {!month?.funnels.length && <p className="text-sm text-stone-500">No funnels yet.</p>}
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
        <p role="status" className="text-sm text-amber-800">
          Refreshing overview…
        </p>
      )}
    </section>
  );
}
