/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";

import { authClient } from "@/app/api/lib/auth-client";
import {
  useGetImportStatusQuery,
  useImportDataMutation,
  useResetImportDataMutation,
} from "@/app/tools/import-data/importData";
import { iconMap } from "@/components/all-icons/all-icons";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { pageDefaults, sidebarDefaults } from "@/lib/defaults/import-data";

import ImportGroup from "./ImportGroup";
import ImportLeads from "./ImportLeads";
import ImportReset from "./ImportReset";
import ImportRow from "./ImportRow";
import ImportSkeleton from "./ImportSkeleton";

const defaultPaths = sidebarDefaults.flatMap((group) => [group.url, ...(group.children ?? []).map((item) => item.url)]);

function errorMessage(error: unknown, fallback: string) {
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
  return error instanceof Error ? error.message : fallback;
}

export default function ImportDataPage() {
  const { data: session, isPending } = authClient.useSession();
  const {
    data: inventory,
    isLoading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useGetImportStatusQuery(undefined, { skip: !session });
  const [importData, { isLoading: importing }] = useImportDataMutation();
  const [resetImportData, { isLoading: resetting }] = useResetImportDataMutation();
  const [toast, setToast] = useState<{ error?: boolean; message: string } | null>(null);
  const [refreshRemaining, setRefreshRemaining] = useState(0);
  const [activeTab, setActiveTab] = useState<"sidebar" | "leads">("sidebar");
  const [selectedSidebarUrls, setSelectedSidebarUrls] = useState(() => new Set(defaultPaths));
  const [selectedPagePaths, setSelectedPagePaths] = useState(() => new Set(pageDefaults.map((page) => page.path)));

  const savedSidebarPaths = useMemo(() => new Set(inventory?.sidebarUrls ?? []), [inventory?.sidebarUrls]);
  const savedPagePaths = useMemo(() => {
    const paths = new Set(inventory?.pagePaths ?? []);
    if (paths.has("/home")) paths.add("/");
    return paths;
  }, [inventory?.pagePaths]);
  const sidebarReady =
    !inventory?.canImportSidebars || [...selectedSidebarUrls].every((path) => savedSidebarPaths.has(path));
  const pagesReady = !inventory?.canImportPages || [...selectedPagePaths].every((path) => savedPagePaths.has(path));
  const ready = sidebarReady && pagesReady;
  const hasSelection = Boolean(
    (inventory?.canImportSidebars && selectedSidebarUrls.size > 0) ||
    (inventory?.canImportPages && selectedPagePaths.size > 0),
  );
  const savedSidebarCount = defaultPaths.filter((path) => savedSidebarPaths.has(path)).length;
  const savedPageCount = pageDefaults.filter((page) => savedPagePaths.has(page.path)).length;
  const hasImportedData = savedSidebarCount > 0 || savedPageCount > 0;

  useEffect(() => {
    if (!refreshRemaining) return;
    const timer = window.setInterval(() => setRefreshRemaining((value) => Math.max(0, value - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [refreshRemaining]);

  async function handleImport() {
    try {
      const result = await importData({
        sidebarUrls: inventory?.canImportSidebars ? [...selectedSidebarUrls] : [],
        pagePaths: inventory?.canImportPages ? [...selectedPagePaths] : [],
      }).unwrap();
      setToast({
        message: `Import complete: ${result.inserted} added, ${result.updated} sidebar records aligned, ${result.pagesInserted} pages created.`,
      });
    } catch (error) {
      setToast({ error: true, message: errorMessage(error, "Could not import the default data.") });
    }
  }

  async function handleReset() {
    try {
      const result = await resetImportData().unwrap();
      setToast({
        message: `Imported data reset: ${result.sidebarsDeleted} navigation items and ${result.pagesDeleted} pages removed.`,
      });
    } catch (error) {
      setToast({ error: true, message: errorMessage(error, "Could not reset the imported data.") });
    }
  }

  function toggleSidebar(url: string, checked: boolean) {
    const group = sidebarDefaults.find((item) => item.url === url);
    const parent = sidebarDefaults.find((item) => item.children?.some((child) => child.url === url));
    setSelectedSidebarUrls((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(url);
        group?.children?.forEach((child) => next.add(child.url));
        if (parent) next.add(parent.url);
      } else {
        next.delete(url);
        if (group) group.children?.forEach((child) => next.delete(child.url));
      }
      return next;
    });
  }

  async function handleRefresh() {
    if (refreshRemaining) return;
    try {
      await refetchInventory().unwrap();
      setRefreshRemaining(60);
      setToast({ message: "Import status refreshed." });
    } catch {
      setToast({ error: true, message: "Could not refresh import status." });
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const tabs: Array<"sidebar" | "leads"> = ["sidebar", "leads"];
    const current = tabs.indexOf(activeTab);
    const nextIndex =
      event.key === "ArrowRight"
        ? (current + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (current - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (nextIndex === null) return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex]);
    document.getElementById(`import-tab-${tabs[nextIndex]}`)?.focus();
  }

  if (isPending) return <ImportSkeleton />;
  if (!session)
    return (
      <main className="grid min-h-[calc(100vh-65px)] place-items-center bg-[#fffaf0] p-4">
        <Link
          className="cursor-pointer rounded-sm bg-amber-100 px-2.5 py-1.5 text-[0.8rem] font-medium text-amber-950 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
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
              <h1 className="text-xl font-semibold text-stone-900">Data importer</h1>
              <p className="mt-1 text-sm text-stone-500">
                Default navigation, pages, and Leads demo data in one place.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="cursor-pointer rounded-sm border-[#eadfca] transition duration-200 hover:-translate-y-0.5 hover:bg-amber-50 focus-visible:ring-amber-200"
              disabled={inventoryLoading || importing || resetting || Boolean(refreshRemaining)}
              onClick={() => void handleRefresh()}
              size="sm"
              variant="outline"
            >
              <span className={inventoryLoading ? "animate-spin" : ""}>{iconMap.RefreshCw}</span>
              {refreshRemaining ? `Refresh ${refreshRemaining}s` : "Refresh"}
            </Button>
            <Button
              className="cursor-pointer rounded-sm bg-emerald-100 text-emerald-900 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:ring-emerald-200"
              disabled={importing || resetting || !hasSelection}
              onClick={() => void handleImport()}
              size="sm"
            >
              {iconMap.Database}
              {importing ? "Importing…" : ready ? "Sync selected" : "Import selected"}
            </Button>
          </div>
        </div>

        <div aria-label="Import type" className="relative mt-6 flex gap-2 border-b border-[#eadfca]" role="tablist">
          {[
            { id: "sidebar", label: "Import Sidebar", icon: iconMap.Menu },
            { id: "leads", label: "Import Leads", icon: iconMap.Users },
          ].map((tab) => (
            <button
              aria-controls={`import-${tab.id}`}
              aria-selected={activeTab === tab.id}
              className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${activeTab === tab.id ? "border-amber-600 text-amber-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}
              id={`import-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "sidebar" | "leads")}
              onKeyDown={handleTabKeyDown}
              role="tab"
              tabIndex={activeTab === tab.id ? 0 : -1}
              type="button"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "sidebar" ? (
          <div
            aria-labelledby="import-tab-sidebar"
            className="relative mt-6 grid gap-4 lg:grid-cols-2"
            id="import-sidebar"
            role="tabpanel"
          >
            {inventoryError ? (
              <p
                className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 lg:col-span-2"
                role="alert"
              >
                Could not load import status. Use Refresh to try again.
              </p>
            ) : null}
            {!inventoryLoading &&
            !inventoryError &&
            inventory &&
            !inventory.canImportSidebars &&
            !inventory.canImportPages &&
            !inventory.canReset ? (
              <p
                className="rounded-sm border border-[#eadfca] bg-[#fffaf0] px-3 py-3 text-sm text-stone-600 lg:col-span-2"
                role="status"
              >
                Your role does not currently have permission to import or reset default data.
              </p>
            ) : null}
            <fieldset className="min-w-0 disabled:opacity-60" disabled={!inventory?.canImportSidebars}>
              <ImportGroup complete={sidebarReady} count={savedSidebarCount} loading={inventoryLoading} title="Sidebar">
                {sidebarDefaults.map((group) => (
                  <div className="rounded-sm border border-[#eadfca] bg-white p-3" key={group.url}>
                    <ImportRow
                      checked={selectedSidebarUrls.has(group.url)}
                      complete={savedSidebarPaths.has(group.url)}
                      icon={group.icon}
                      label={group.name}
                      onCheckedChange={(checked) => toggleSidebar(group.url, checked)}
                      variant="card"
                    />
                    {group.children?.length ? (
                      <div className="mt-2 grid gap-1 border-l border-[#eadfca] pl-3">
                        {group.children.map((child) => (
                          <ImportRow
                            checked={selectedSidebarUrls.has(child.url)}
                            complete={savedSidebarPaths.has(child.url)}
                            icon={child.icon}
                            key={child.url}
                            label={child.name}
                            onCheckedChange={(checked) => toggleSidebar(child.url, checked)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </ImportGroup>
            </fieldset>
            <fieldset className="min-w-0 disabled:opacity-60" disabled={!inventory?.canImportPages}>
              <ImportGroup complete={pagesReady} count={savedPageCount} loading={inventoryLoading} title="Pages">
                {pageDefaults.map((page) => (
                  <ImportRow
                    checked={selectedPagePaths.has(page.path)}
                    complete={savedPagePaths.has(page.path)}
                    icon="FileText"
                    key={page.path}
                    label={page.title}
                    onCheckedChange={(checked) =>
                      setSelectedPagePaths((current) => {
                        const next = new Set(current);
                        if (checked) next.add(page.path);
                        else next.delete(page.path);
                        return next;
                      })
                    }
                    path={page.path}
                    variant="card"
                  />
                ))}
              </ImportGroup>
            </fieldset>
          </div>
        ) : (
          <div aria-labelledby="import-tab-leads" className="relative mt-6" id="import-leads" role="tabpanel">
            <ImportLeads onNotice={setToast} />
          </div>
        )}

        <ImportReset
          canReset={Boolean(inventory?.canReset)}
          hasImportedData={hasImportedData}
          isResetting={resetting}
          onReset={handleReset}
        />
      </section>
    </main>
  );
}
