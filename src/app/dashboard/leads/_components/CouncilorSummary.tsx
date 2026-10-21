/*
|-----------------------------------------
| setting up councilor customer line graph
| @author: Codex
|-----------------------------------------
*/

import { useState } from "react";

import type { LeadCouncilorSummaries } from "@/lib/dashboard/leads";

import CustomerPie from "./CustomerPie";
import { leadPanel } from "./presentation";
import { errorMessage } from "./ui";

type Metric = "total" | "active" | "inactive";
const colors = ["#047857", "#b45309", "#2563eb", "#be185d", "#7c3aed", "#0e7490", "#c2410c", "#4d7c0f"];
const dashes = [undefined, "7 3", "2 3", "9 3 2 3"];

export default function CouncilorSummary({
  data,
  isLoading,
  error,
}: {
  data?: LeadCouncilorSummaries;
  isLoading: boolean;
  error: unknown;
}) {
  const [metric, setMetric] = useState<Metric>("total");
  const [point, setPoint] = useState<{
    councilor: string;
    funnel: string;
    total: number;
    active: number;
    inactive: number;
  } | null>(null);
  const items = data?.items ?? [];
  const funnelMap = new Map<string, string>();
  items.forEach((item) => item.funnels.forEach((funnel) => funnelMap.set(funnel.id, funnel.name)));
  const funnels = Array.from(funnelMap, ([id, name]) => ({ id, name }));
  const values = items.map((item) =>
    funnels.map((funnel) => {
      const entry = item.funnels.find((row) => row.id === funnel.id);
      return {
        total: entry?.customerCount ?? 0,
        active: entry?.statuses.active ?? 0,
        inactive: entry?.statuses.inactive ?? 0,
      };
    }),
  );
  const maximum = values.reduce((max, row) => row.reduce((current, value) => Math.max(current, value[metric]), max), 1);
  const width = Math.max(700, funnels.length * 130);
  const height = 300;
  const left = 50;
  const right = 40;
  const top = 20;
  const bottom = 65;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const x = (index: number) =>
    funnels.length === 1 ? left + chartWidth / 2 : left + (index * chartWidth) / (funnels.length - 1);
  const y = (value: number) => top + chartHeight * (1 - value / maximum);

  return (
    <div className="grid min-w-0 gap-4">
      {data && <CustomerPie data={data} />}
      <section className={`${leadPanel} min-w-0 p-4 sm:p-5`} aria-labelledby="councilor-graph-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="councilor-graph-title" className="text-sm font-semibold text-slate-900">
              Customers by funnel
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Each line represents one councilor. Hover or focus a point for its status breakdown.
            </p>
          </div>
          <div className="flex rounded-sm border border-[#eadfca] bg-[#fffdf8] p-1" aria-label="Customer status">
            {(["total", "active", "inactive"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={metric === value}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold capitalize ${metric === value ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-amber-50"}`}
                onClick={() => {
                  setMetric(value);
                  setPoint(null);
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <p className="py-5 text-sm text-slate-500" role="status">
            Loading graph…
          </p>
        ) : error ? (
          <p className="mt-3 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {errorMessage(error)}
          </p>
        ) : !items.length ? (
          <p className="py-5 text-sm text-slate-500">No councilors to display yet.</p>
        ) : !funnels.length ? (
          <p className="py-5 text-sm text-slate-500">No funnels to display yet.</p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-y border-[#eadfca] py-2.5">
              {items.map((councilor, index) => (
                <div
                  key={councilor.id}
                  className="flex items-center gap-1.5 text-xs text-slate-700"
                  title={`${councilor.email}: ${councilor.customerCount} total, ${councilor.customerStatuses.active} active, ${councilor.customerStatuses.inactive} inactive`}
                >
                  <svg aria-hidden="true" width="22" height="10" className="shrink-0">
                    <line
                      x1="0"
                      y1="5"
                      x2="22"
                      y2="5"
                      stroke={colors[index % colors.length]}
                      strokeWidth="2.5"
                      strokeDasharray={dashes[Math.floor(index / colors.length) % dashes.length]}
                    />
                  </svg>
                  <span className="font-medium">{councilor.name}</span>
                  <span className="tabular-nums text-slate-500">({councilor.customerCount})</span>
                </div>
              ))}
            </div>
            <div className="min-h-9 py-2 text-xs text-slate-600" aria-live="polite">
              {point ? (
                <>
                  <strong className="text-slate-900">
                    {point.councilor} · {point.funnel}
                  </strong>{" "}
                  — {point.total} total · {point.active} active · {point.inactive} inactive
                </>
              ) : (
                "Select a status above; hover or focus a point for exact counts."
              )}
            </div>
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="block w-full min-w-[700px]"
                aria-label={`Line graph of ${metric} customers by funnel and councilor`}
              >
                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                  <g key={fraction}>
                    <line
                      x1={left}
                      x2={width - right}
                      y1={y(maximum * fraction)}
                      y2={y(maximum * fraction)}
                      stroke="#eadfca"
                      strokeDasharray="3 4"
                    />
                    <text x={left - 10} y={y(maximum * fraction) + 4} textAnchor="end" fill="#64748b" fontSize="11">
                      {(maximum * fraction).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </text>
                  </g>
                ))}
                {funnels.map((funnel, index) => (
                  <text
                    key={funnel.id}
                    x={x(index)}
                    y={height - bottom + 24}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="11"
                  >
                    <title>{funnel.name}</title>
                    {funnel.name.length > 20 ? `${funnel.name.slice(0, 19)}…` : funnel.name}
                  </text>
                ))}
                {items.map((councilor, index) => (
                  <g key={councilor.id}>
                    <polyline
                      fill="none"
                      stroke={colors[index % colors.length]}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={dashes[Math.floor(index / colors.length) % dashes.length]}
                      points={values[index].map((value, i) => `${x(i)},${y(value[metric])}`).join(" ")}
                    />
                    {values[index].map((value, i) => {
                      const detail = { councilor: councilor.name, funnel: funnels[i].name, ...value };
                      return (
                        <circle
                          key={funnels[i].id}
                          cx={x(i)}
                          cy={y(value[metric])}
                          r="5"
                          fill={colors[index % colors.length]}
                          stroke="white"
                          strokeWidth="2"
                          tabIndex={0}
                          role="img"
                          aria-label={`${councilor.name}, ${funnels[i].name}: ${value.total} total, ${value.active} active, ${value.inactive} inactive`}
                          onMouseEnter={() => setPoint(detail)}
                          onMouseLeave={() => setPoint(null)}
                          onFocus={() => setPoint(detail)}
                          onBlur={() => setPoint(null)}
                        >
                          <title>{`${councilor.name}, ${funnels[i].name}: ${value.total} total, ${value.active} active, ${value.inactive} inactive`}</title>
                        </circle>
                      );
                    })}
                  </g>
                ))}
              </svg>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
