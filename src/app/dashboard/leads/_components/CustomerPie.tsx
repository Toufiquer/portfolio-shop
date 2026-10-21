/*
|-----------------------------------------
| setting up customer distribution pie chart
| @author: Codex
|-----------------------------------------
*/

import { useState } from "react";

import type { LeadCouncilorSummaries } from "@/lib/dashboard/leads";

import { leadPanel } from "./presentation";

const colors = ["#059669", "#d97706", "#2563eb", "#db2777", "#7c3aed", "#0891b2", "#ea580c", "#65a30d"];
function piePath(start: number, end: number) {
  const point = (angle: number) => ({ x: 110 + 94 * Math.cos(angle), y: 110 + 94 * Math.sin(angle) });
  const first = point(start);
  const last = point(end);
  if (end - start >= 2 * Math.PI - 0.000001) {
    const opposite = point(start + Math.PI);
    return `M 110 110 L ${first.x} ${first.y} A 94 94 0 1 1 ${opposite.x} ${opposite.y} A 94 94 0 1 1 ${first.x} ${first.y} Z`;
  }
  return `M 110 110 L ${first.x} ${first.y} A 94 94 0 ${end - start > Math.PI ? 1 : 0} 1 ${last.x} ${last.y} Z`;
}

export default function CustomerPie({ data }: { data: LeadCouncilorSummaries }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const entries = [...data.items, ...data.others];
  const total = entries.reduce((sum, entry) => sum + entry.customerCount, 0);
  const visible =
    entries.find((entry) => entry.id === hovered) ??
    entries.find((entry) => entry.id === selected) ??
    entries.find((entry) => entry.customerCount > 0) ??
    entries[0];
  let angle = -Math.PI / 2;
  const segments = entries.map((entry, index) => {
    const start = angle;
    angle += total ? (entry.customerCount / total) * Math.PI * 2 : 0;
    return { entry, start, end: angle, color: colors[index % colors.length] };
  });

  return (
    <section className={`${leadPanel} min-w-0 p-4 sm:p-5`} aria-labelledby="customer-pie-title">
      <h2 id="customer-pie-title" className="text-sm font-semibold text-slate-900">
        Customer distribution
      </h2>
      <p className="mt-1 text-xs text-slate-500">Hover or select a slice to see its customer details.</p>
      {total === 0 ? (
        <p className="py-6 text-sm text-slate-500">No customers to display yet.</p>
      ) : (
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,1fr)]">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-center">
            <svg
              viewBox="0 0 220 220"
              className="mx-auto w-full max-w-[220px]"
              aria-label={`Customer distribution: ${total} customers`}
            >
              {segments
                .filter(({ entry }) => entry.customerCount > 0)
                .map(({ entry, start, end, color }) => (
                  <path
                    key={entry.id}
                    d={piePath(start, end)}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    tabIndex={0}
                    role="button"
                    aria-label={`${entry.name}: ${entry.customerCount} customers`}
                    aria-pressed={visible?.id === entry.id}
                    className="cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus-visible:stroke-stone-900"
                    onMouseEnter={() => setHovered(entry.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(entry.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setSelected(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelected(entry.id);
                      }
                    }}
                  >
                    <title>
                      {entry.name}: {entry.customerCount}
                    </title>
                  </path>
                ))}
            </svg>
            <div className="grid content-start gap-1.5">
              <p className="mb-1 text-xs font-semibold text-slate-800">{total.toLocaleString()} customers</p>
              {segments.map(({ entry, color }) => (
                <button
                  key={entry.id}
                  type="button"
                  onMouseEnter={() => setHovered(entry.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(entry.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setSelected(entry.id)}
                  aria-pressed={visible?.id === entry.id}
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs ${visible?.id === entry.id ? "bg-amber-50 font-semibold text-slate-900" : "text-slate-600 hover:bg-stone-50"}`}
                >
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="min-w-0 flex-1 break-words">{entry.name}</span>
                  <span className="tabular-nums">{entry.customerCount.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
          {visible && (
            <div className="min-w-0 rounded-sm border border-[#eadfca] bg-[#fffdf8] p-4" aria-live="polite">
              <h3 className="break-words text-sm font-semibold text-slate-900">{visible.name}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {visible.customerCount.toLocaleString()} customers ·{" "}
                {((visible.customerCount / total) * 100).toFixed(1)}%
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-sm border border-emerald-100 bg-emerald-50 p-2 text-emerald-800">
                  Active{" "}
                  <strong className="float-right tabular-nums">
                    {visible.customerStatuses.active.toLocaleString()}
                  </strong>
                </div>
                <div className="rounded-sm border border-rose-100 bg-rose-50 p-2 text-rose-800">
                  Inactive{" "}
                  <strong className="float-right tabular-nums">
                    {visible.customerStatuses.inactive.toLocaleString()}
                  </strong>
                </div>
              </div>
              <h4 className="mt-4 text-xs font-semibold text-slate-800">By funnel</h4>
              {visible.funnels.length ? (
                <ul className="mt-2 divide-y divide-[#eadfca]">
                  {visible.funnels.map((funnel) => (
                    <li
                      key={funnel.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-2 py-1.5 text-xs"
                    >
                      <span className="break-words font-medium text-slate-700">{funnel.name}</span>
                      <span className="tabular-nums text-slate-500">
                        {funnel.customerCount} total · {funnel.statuses.active} active · {funnel.statuses.inactive}{" "}
                        inactive
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">No funnels available.</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
