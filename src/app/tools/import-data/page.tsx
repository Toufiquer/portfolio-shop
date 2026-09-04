/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 22 August 2026
|-----------------------------------------
*/

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { authClient } from "@/app/api/lib/auth-client";
import { pageDefaults, sidebarDefaults } from "@/app/tools/import-data/defaults";
import { iconMap } from "@/components/all-icons/all-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { useImportDataMutation } from "@/redux/features/dashboard/import-data/importDataSlice";
import { useGetPagesQuery } from "@/redux/features/dashboard/pages/pagesSlice";
import { useGetSidebarsQuery } from "@/redux/features/dashboard/sidebars/sidebarSlice";

const defaultPaths = sidebarDefaults.flatMap((group) => [group.url, ...(group.children ?? []).map((item) => item.url)]);

export default function ImportDataPage() {
  const { data: session, isPending } = authClient.useSession();
  const {
    data: sidebarData,
    isLoading: sidebarsLoading,
    refetch: refetchSidebars,
  } = useGetSidebarsQuery(undefined, { skip: !session });
  const {
    data: pageData,
    isLoading: pagesLoading,
    refetch: refetchPages,
  } = useGetPagesQuery(undefined, { skip: !session });
  const [importData, { isLoading: importing }] = useImportDataMutation();
  const [toast, setToast] = useState<{ error?: boolean; message: string } | null>(null);
  const [refreshRemaining, setRefreshRemaining] = useState(0);

  const savedSidebarPaths = useMemo(
    () => new Set(sidebarData?.items.map((item) => item.url) ?? []),
    [sidebarData?.items],
  );
  const savedPagePaths = useMemo(() => new Set(pageData?.items.map((item) => item.path) ?? []), [pageData?.items]);
  const sidebarReady = defaultPaths.every((path) => savedSidebarPaths.has(path));
  const pagesReady = pageDefaults.every((page) => savedPagePaths.has(page.path));
  const ready = sidebarReady && pagesReady;

  useEffect(() => {
    if (!refreshRemaining) return;
    const timer = window.setInterval(() => setRefreshRemaining((value) => Math.max(0, value - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [refreshRemaining]);

  async function handleImport() {
    try {
      const result = await importData("all").unwrap();
      setToast({
        message: `Import complete: ${result.inserted} added, ${result.updated} sidebar records aligned, ${result.pagesInserted} pages created.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error &&
              "data" in error &&
              typeof error.data === "object" &&
              error.data &&
              "error" in error.data &&
              typeof error.data.error === "string"
            ? error.data.error
            : "Could not import the default data.";
      setToast({ error: true, message });
    }
  }

  async function handleRefresh() {
    if (refreshRemaining) return;
    try {
      await Promise.all([refetchSidebars().unwrap(), refetchPages().unwrap()]);
      setRefreshRemaining(60);
      setToast({ message: "Import status refreshed." });
    } catch {
      setToast({ error: true, message: "Could not refresh import status." });
    }
  }

  if (isPending) return <ImportSkeleton />;
  if (!session)
    return (
      <main className="grid min-h-[calc(100vh-65px)] place-items-center bg-[#fffaf0] p-4">
        <Link
          className="cursor-pointer rounded-sm bg-amber-100 px-2.5 py-1.5 text-[0.8rem] font-medium text-amber-950 transition duration-700 hover:-translate-y-0.5 hover:bg-amber-200"
          href="/login"
        >
          Sign in required
        </Link>
      </main>
    );

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#fffaf0] px-4 py-8 sm:px-6 lg:px-10">
      {toast ? <Toast error={toast.error} message={toast.message} onDismiss={() => setToast(null)} /> : null}
      <section className="relative mx-auto max-w-5xl overflow-hidden rounded-sm border border-[#eadfca] bg-white p-5 shadow-[0_20px_60px_-35px_rgba(120,53,15,.32)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-200/50 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-sm bg-amber-100 text-amber-900">
              {iconMap.Database}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-stone-900">Import defaults</h1>
              <p className="mt-1 text-sm text-stone-500">Pages and dashboard navigation in one click.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="cursor-pointer border-[#eadfca] transition duration-700 hover:-translate-y-0.5 hover:bg-amber-50"
              disabled={sidebarsLoading || pagesLoading || importing || Boolean(refreshRemaining)}
              onClick={() => void handleRefresh()}
              size="sm"
              variant="outline"
            >
              <span className={sidebarsLoading || pagesLoading ? "animate-spin" : ""}>{iconMap.RefreshCw}</span>
              {refreshRemaining ? `Refresh ${refreshRemaining}s` : "Refresh"}
            </Button>
            <Button
              className="cursor-pointer bg-emerald-100 text-emerald-900 transition duration-700 hover:-translate-y-0.5 hover:bg-emerald-200"
              disabled={importing}
              onClick={() => void handleImport()}
              size="sm"
            >
              {iconMap.Database}
              {importing ? "Importing…" : ready ? "Sync defaults" : "Import pages & sidebar"}
            </Button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 lg:grid-cols-2">
          <ImportGroup
            complete={sidebarReady}
            count={sidebarData?.items.length ?? 0}
            loading={sidebarsLoading}
            title="Sidebar"
          >
            {sidebarDefaults.map((group) => (
              <div className="rounded-sm border border-[#eadfca] bg-white p-3" key={group.url}>
                <ImportRow complete={savedSidebarPaths.has(group.url)} icon={group.icon} label={group.name} />
                <div className="mt-2 grid gap-1 border-l border-[#eadfca] pl-3">
                  {(group.children ?? []).map((child) => (
                    <ImportRow
                      complete={savedSidebarPaths.has(child.url)}
                      icon={child.icon}
                      key={child.url}
                      label={child.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </ImportGroup>
          <ImportGroup complete={pagesReady} count={pageData?.items.length ?? 0} loading={pagesLoading} title="Pages">
            {pageDefaults.map((page) => (
              <ImportRow
                complete={savedPagePaths.has(page.path)}
                icon="FileText"
                key={page.path}
                label={page.title}
                path={page.path}
              />
            ))}
          </ImportGroup>
        </div>
      </section>
    </main>
  );
}

function ImportGroup({
  children,
  complete,
  count,
  loading,
  title,
}: {
  children: ReactNode;
  complete: boolean;
  count: number;
  loading: boolean;
  title: string;
}) {
  return (
    <section className="rounded-sm border border-[#eadfca] bg-[#fffaf0] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-stone-900">{title}</h2>
          <p className="mt-0.5 text-xs text-stone-500">{loading ? "Checking…" : `${count} saved`}</p>
        </div>
        <span className={complete ? "text-emerald-700" : "text-amber-700"}>
          {complete ? iconMap.Check : iconMap.RefreshCw}
        </span>
      </div>
      <div className="grid gap-2">{loading ? <ImportSkeleton compact /> : children}</div>
    </section>
  );
}

function ImportRow({ complete, icon, label, path }: { complete: boolean; icon: string; label: string; path?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
      <span className="shrink-0 text-stone-500">{iconMap[icon] ?? iconMap.FileText}</span>
      <span className={`min-w-0 flex-1 truncate ${complete ? "text-stone-500" : "text-stone-800"}`} title={label}>
        {label}
      </span>
      {path ? (
        <span className="max-w-24 truncate text-xs text-stone-400" title={path}>
          {path}
        </span>
      ) : null}
      <span className={complete ? "shrink-0 text-emerald-700" : "shrink-0 text-amber-700"}>
        {complete ? iconMap.Check : iconMap.Plus}
      </span>
    </div>
  );
}

function ImportSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact)
    return (
      <div className="grid gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  return (
    <main className="grid min-h-[calc(100vh-65px)] place-items-center bg-[#fffaf0] p-4">
      <div className="w-full max-w-5xl rounded-sm border border-[#eadfca] bg-white p-7">
        <Skeleton className="size-10" />
        <Skeleton className="mt-5 h-7 w-52" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      </div>
    </main>
  );
}
