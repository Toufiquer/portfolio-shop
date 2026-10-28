/*
|-----------------------------------------
| setting up the empty-workspace Leads demo data import
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import { useState } from "react";

import { iconMap } from "@/components/all-icons/all-icons";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetLeadsDemoStateQuery, useSeedLeadsDemoMutation } from "@/redux/features/dashboard/leads/leadsSlice";

type ImportNotice = { error?: boolean; message: string };

function errorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "error" in error.data &&
    typeof error.data.error === "string"
  )
    return error.data.error;
  return error instanceof Error ? error.message : "Could not add the Leads demo data.";
}

export default function ImportLeads({ onNotice }: { onNotice: (notice: ImportNotice) => void }) {
  const [confirming, setConfirming] = useState(false);
  const { data, isError, isLoading: stateLoading } = useGetLeadsDemoStateQuery();
  const [seed, { isLoading }] = useSeedLeadsDemoMutation();
  if (stateLoading)
    return (
      <section className="rounded-sm border border-dashed border-amber-300 bg-amber-50/70 p-5" role="status">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <span className="sr-only">Checking Leads demo data availability</span>
      </section>
    );
  if (isError)
    return (
      <section className="rounded-sm border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">
        Could not check whether Leads demo data can be added. Refresh and try again.
      </section>
    );
  if (!data?.available)
    return (
      <section className="rounded-sm border border-[#eadfca] bg-[#fffaf0] p-5" role="status">
        <p className="font-semibold text-stone-900">Demo data is unavailable</p>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Leads demo data can be added only while the Leads workspace is empty.
        </p>
      </section>
    );

  async function insertDemo() {
    try {
      const result = await seed().unwrap();
      setConfirming(false);
      onNotice({
        message: `${result.customers} demo customers, ${result.funnels} funnels, ${result.councilors} councilors, and ${result.notes} notes added.`,
      });
    } catch (error) {
      onNotice({ error: true, message: errorMessage(error) });
    }
  }

  return (
    <section className="rounded-sm border border-dashed border-amber-300 bg-amber-50/70 p-5 shadow-[0_2px_8px_rgba(120,80,30,0.035)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-sm border border-amber-200 bg-white text-amber-700">
            {iconMap.Database}
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-900">Import Leads demo data</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
              Adds realistic demo data to explore every Leads tab, only while the Leads workspace is empty.
            </p>
          </div>
        </div>
        <Button
          className="cursor-pointer rounded-sm bg-amber-700 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-amber-800 focus-visible:ring-amber-300"
          disabled={isLoading}
          onClick={() => setConfirming(true)}
          size="sm"
        >
          {iconMap.Plus}
          Add demo data
        </Button>
      </div>
      <div className="mt-4 grid gap-2 border-t border-amber-200/80 pt-4 text-xs text-stone-600 sm:grid-cols-4">
        <p>
          <strong className="text-stone-800">200</strong> demo customers
        </p>
        <p>
          <strong className="text-stone-800">5</strong> business funnels
        </p>
        <p>
          <strong className="text-stone-800">5</strong> councilors
        </p>
        <p>
          <strong className="text-stone-800">200</strong> notes
        </p>
      </div>
      <AlertDialog
        open={confirming}
        title="Add Leads demo data?"
        description="This creates 200 customers with notes, 5 funnels, and 5 councilors. It can only run while all Leads data is empty."
        busy={isLoading}
        confirmLabel="Add demo data"
        busyLabel="Adding demo data…"
        onCancel={() => setConfirming(false)}
        onConfirm={() => void insertDemo()}
      />
    </section>
  );
}
