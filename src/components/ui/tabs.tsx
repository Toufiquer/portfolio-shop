/*
|-----------------------------------------
| setting up tabs.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

/*
|-----------------------------------------
| reusable tabs UI primitive
|-----------------------------------------
*/

"use client";

import * as React from "react";

import { cn } from "@/app/api/lib/utils";

type TabsContextValue = { value: string; setValue: (value: string) => void };
const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({ value, defaultValue, onValueChange, className, children }: { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; className?: string; children: React.ReactNode }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const activeValue = value ?? internalValue;
  const setValue = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };
  return <TabsContext.Provider value={{ value: activeValue, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="tablist" className={cn("inline-flex items-center", className)} {...props} />;
}

export function TabsTrigger({ value, className, children, ...props }: React.ComponentProps<"button"> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  const active = context.value === value;
  return <button type="button" role="tab" aria-selected={active} data-state={active ? "active" : "inactive"} className={cn(className)} onClick={() => context.setValue(value)} {...props}>{children}</button>;
}

export function TabsContent({ value, className, children, ...props }: React.ComponentProps<"div"> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  return context.value === value ? <div role="tabpanel" className={className} {...props}>{children}</div> : null;
}
