/*
|-----------------------------------------
| setting up imported data reset controls
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import { useState } from "react";

import { iconMap } from "@/components/all-icons/all-icons";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function ImportReset({
  canReset,
  hasImportedData,
  isResetting,
  onReset,
}: {
  canReset: boolean;
  hasImportedData: boolean;
  isResetting: boolean;
  onReset: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const disabled = !canReset || !hasImportedData || isResetting;

  async function confirmReset() {
    try {
      await onReset();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <>
      <footer className="relative mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#eadfca] pt-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-stone-900">Reset imported data</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
            Removes only the default navigation and pages imported here. Your unrelated workspace data remains
            untouched.
          </p>
        </div>
        <Button
          className="cursor-pointer rounded-sm bg-red-100 text-red-800 transition duration-200 hover:-translate-y-0.5 hover:bg-red-200 focus-visible:ring-red-200"
          disabled={disabled}
          onClick={() => setConfirming(true)}
          size="sm"
          title={!canReset ? "Delete permission for Sidebar and Pages is required." : undefined}
          variant="destructive"
        >
          {iconMap.Trash2}
          Reset All
        </Button>
      </footer>
      <AlertDialog
        open={confirming}
        title="Reset imported data?"
        description="This removes the default navigation and pages imported from this tool. Other workspace data will not be changed."
        busy={isResetting}
        confirmLabel="Reset All"
        busyLabel="Resetting…"
        onCancel={() => setConfirming(false)}
        onConfirm={() => void confirmReset()}
      />
    </>
  );
}
