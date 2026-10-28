/*
|-----------------------------------------
| setting up importer loading states
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ImportSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact)
    return (
      <div className="grid gap-2" role="status">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <span className="sr-only">Loading import status</span>
      </div>
    );

  return (
    <main className="grid min-h-[calc(100vh-65px)] place-items-center bg-[#fffaf0] p-4">
      <div className="w-full max-w-5xl rounded-sm border border-[#eadfca] bg-white p-7">
        <Skeleton className="size-10" />
        <Skeleton className="mt-5 h-7 w-52" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        <span className="sr-only">Loading data importer</span>
      </div>
    </main>
  );
}
