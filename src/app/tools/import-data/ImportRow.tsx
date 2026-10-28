/*
|-----------------------------------------
| setting up a selectable import data row
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import { iconMap } from "@/components/all-icons/all-icons";
import { Checkbox } from "@/components/ui/checkbox";

export default function ImportRow({
  checked,
  complete,
  icon,
  label,
  onCheckedChange,
  path,
  variant = "nested",
}: {
  checked: boolean;
  complete: boolean;
  icon: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  path?: string;
  variant?: "card" | "nested";
}) {
  return (
    <label
      className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition duration-200 ${variant === "card" ? "border border-[#eadfca] bg-white hover:border-amber-200" : "hover:bg-amber-50/50"}`}
    >
      <Checkbox
        checked={checked}
        className="size-4 shrink-0 cursor-pointer accent-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        onCheckedChange={onCheckedChange}
      />
      <span aria-hidden="true" className="shrink-0 text-stone-500">
        {iconMap[icon] ?? iconMap.FileText}
      </span>
      <span className={`min-w-0 flex-1 truncate ${complete ? "text-stone-500" : "text-stone-800"}`} title={label}>
        {label}
      </span>
      {path ? (
        <span className="max-w-24 truncate text-xs text-stone-400" title={path}>
          {path}
        </span>
      ) : null}
      <span
        aria-label={complete ? "Already imported" : "Pending import"}
        className={complete ? "shrink-0 text-emerald-700" : "shrink-0 text-amber-700"}
      >
        {complete ? iconMap.Check : iconMap.Plus}
      </span>
    </label>
  );
}
