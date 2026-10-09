/*
|-----------------------------------------
| setting up shared Leads UI
| @author: Codex
|-----------------------------------------
*/

"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { Icon } from "@/components/all-icons/all-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeadKind } from "@/lib/dashboard/leads";
import { useGetLeadOptionsQuery } from "@/redux/features/dashboard/leads/leadsSlice";

export const normalButton =
  "cursor-pointer rounded-sm border-[#eadfca] bg-amber-100 text-amber-900 transition duration-700 hover:bg-amber-200";
export function Action({
  tone = "normal",
  className = "",
  ...props
}: ComponentProps<typeof Button> & { tone?: "normal" | "save" | "delete" }) {
  return (
    <Button
      {...props}
      className={`${normalButton} ${tone === "save" ? "bg-green-100 text-green-900 hover:bg-green-200" : tone === "delete" ? "bg-red-100 text-red-900 hover:bg-red-200" : ""} ${className}`}
      size="sm"
      variant="outline"
    />
  );
}
export function LeadSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className="h-8 cursor-pointer rounded-sm border border-[#eadfca] bg-white px-2 text-sm transition duration-700"
          disabled={disabled}
        >
          <span className="truncate">{options.find((option) => option.value === value)?.label ?? label}</span>
          <Icon name="ChevronDown" className="size-3 shrink-0" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-auto border border-[#eadfca] bg-white">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              className="cursor-pointer text-sm transition duration-700 hover:bg-amber-50"
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function Pagination({
  page,
  total,
  pageSize,
  onPage,
  onSize,
  disabled,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
  disabled?: boolean;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eadfca] p-3 text-sm">
      <span>
        {total.toLocaleString()} records · Page {page} of {pages}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <LeadSelect
          label="Items per page"
          value={String(pageSize)}
          options={[10, 25, 50, 100].map((size) => ({ value: String(size), label: `${size} / page` }))}
          onChange={(size) => onSize(Number(size))}
          disabled={disabled}
        />
        <Action aria-label="Previous page" disabled={disabled || page <= 1} onClick={() => onPage(page - 1)}>
          <Icon name="ArrowLeft" />
          Previous
        </Action>
        <Action aria-label="Next page" disabled={disabled || page >= pages} onClick={() => onPage(page + 1)}>
          Next
          <Icon name="ChevronRight" />
        </Action>
      </div>
    </div>
  );
}
export function useRefreshCooldown() {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return { remaining, start: () => setRemaining(60) };
}
export function LeadsSkeleton() {
  return (
    <div aria-label="Loading Leads" className="grid gap-3 p-3" role="status">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
export function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data;
    if (data && typeof data === "object" && "error" in data && typeof data.error === "string") return data.error;
  }
  return error instanceof Error ? error.message : "Could not complete the action. Please try again.";
}
export function LeadsModal({
  title,
  onClose,
  busy,
  children,
}: {
  title: string;
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => {
    closeRef.current = onClose;
    busyRef.current = busy;
  }, [onClose, busy]);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const elements = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? [],
      );
    elements()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key === "Tab") {
        const nodes = elements().filter((node) => node.getClientRects().length);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-xl rounded-sm border border-[#eadfca] bg-white shadow-xl"
      >
        <div ref={panel}>
          <DialogHeader className="flex items-center justify-between gap-2 border-b border-[#eadfca] p-3">
            <DialogTitle id={titleId} className="font-semibold">
              {title}
            </DialogTitle>
            <Action aria-label="Close dialog" disabled={busy} onClick={onClose}>
              <Icon name="X" />
            </Action>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh]">{children}</ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Paginated selections keep large funnel/councilor lists usable on mobile. */
export function RecordSelect({
  area = "customers",
  kind,
  value,
  label,
  selectedLabel,
  onChange,
  allowEmpty = true,
  activeOnly = false,
  disabled = false,
}: {
  area?: string;
  kind: Exclude<LeadKind, "customers">;
  value: string;
  label: string;
  selectedLabel?: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
  activeOnly?: boolean;
  disabled?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [chosenLabel, setChosenLabel] = useState(selectedLabel || value);
  const { data, isFetching, error } = useGetLeadOptionsQuery({
    kind,
    area,
    page,
    pageSize,
    search,
    ...(activeOnly ? { status: "active" } : {}),
  });
  const options = data?.items.map((item) => ({ value: item.value, label: item.name })) ?? [];
  if (value && !options.some((option) => option.value === value))
    options.unshift({ value, label: chosenLabel || value });
  return (
    <div className="grid min-w-0 grid-cols-1 gap-1 rounded-sm border border-[#eadfca] p-2">
      <LeadSelect
        label={label}
        value={value}
        options={[...(allowEmpty ? [{ value: "", label }] : []), ...options]}
        onChange={(next) => {
          setChosenLabel(options.find((option) => option.value === next)?.label ?? next);
          onChange(next);
        }}
        disabled={disabled || isFetching}
      />
      <div className="flex gap-1">
        <input
          aria-label={`Search ${kind} options`}
          className="h-7 min-w-0 flex-1 rounded-sm border border-[#eadfca] px-2 text-xs"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Find ${kind}`}
          maxLength={160}
          disabled={disabled}
        />
        <Action
          disabled={disabled || isFetching}
          onClick={() => {
            setSearch(text);
            setPage(1);
          }}
        >
          {isFetching ? "Loading…" : "Find"}
        </Action>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {errorMessage(error)}
        </p>
      )}
      {(data?.total ?? 0) > 10 && (
        <Pagination
          page={data?.page ?? page}
          total={data?.total ?? 0}
          pageSize={pageSize}
          onPage={setPage}
          onSize={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          disabled={disabled || isFetching}
        />
      )}
    </div>
  );
}
