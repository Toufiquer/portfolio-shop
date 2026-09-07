/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Codex
|-----------------------------------------
*/

"use client";

import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  Eye,
  FileUp,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import * as XLSX from "xlsx";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/global-toast";
import { LoadingState } from "@/components/ui/loading-state";
import {
  customerStatuses,
  type Customer,
  type CustomerFunnel,
  type CustomerSpend,
  type CustomerStatus,
} from "@/lib/dashboard/customers";
import {
  useBulkDeleteCustomersMutation,
  useBulkDeleteFunnelsMutation,
  useBulkUpdateCustomersMutation,
  useCreateCustomerMutation,
  useCreateDemoSpendsMutation,
  useCreateFunnelMutation,
  useCreateSpendMutation,
  useDeleteFunnelMutation,
  useGetCustomerOverviewQuery,
  useGetCustomersQuery,
  useGetFunnelsQuery,
  useGetSpendsQuery,
  useImportCustomersMutation,
  useImportDemoCustomersWithOrdersMutation,
  useUpdateCustomerMutation,
  useUpdateFunnelMutation,
} from "@/redux/features/dashboard/customer/customerSlice";
type Tab = "funnels" | "customers" | "overview" | "spend";
type ImportRow = Partial<Customer> & { number?: string };
const pageSizes = [10, 25, 50, 100] as const;
const demoFunnels = [
  ["Follower", "", 0, 0, "#0ea5e9"],
  ["Interested", "", 0, 0, "#8b5cf6"],
  ["Paid Customer", "", 0, 1000, "#10b981"],
  ["Premium Customer", "", 1001, 10000, "#f59e0b"],
  ["VIP Customer", "", 10001, null, "#e11d48"],
] as const;
const errorMessage = (error: unknown, fallback: string) =>
  typeof error === "object" &&
  error &&
  "data" in error &&
  typeof (error as { data?: { error?: string } }).data?.error === "string"
    ? (error as { data: { error: string } }).data.error
    : fallback;
export default function CustomerPage() {
  const [tab, setTab] = useState<Tab>("funnels"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState<CustomerStatus>(),
    [funnelFilter, setFunnelFilter] = useState(""),
    [filterOpen, setFilterOpen] = useState(false),
    [draftStatus, setDraftStatus] = useState<CustomerStatus | undefined>(),
    [draftFunnelFilter, setDraftFunnelFilter] = useState(""),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(10),
    [funnelPage, setFunnelPage] = useState(1),
    [funnelPageSize, setFunnelPageSize] = useState<(typeof pageSizes)[number]>(10),
    [spendPage, setSpendPage] = useState(1),
    [spendPageSize, setSpendPageSize] = useState<(typeof pageSizes)[number]>(10),
    [selected, setSelected] = useState<string[]>([]),
    [bulkStatus, setBulkStatus] = useState<CustomerStatus>("active"),
    [bulkFunnelId, setBulkFunnelId] = useState("__unchanged"),
    [bulkStatusOpen, setBulkStatusOpen] = useState(false),
    [funnelForm, setFunnelForm] = useState<CustomerFunnel | null | undefined>(),
    [customerForm, setCustomerForm] = useState<Customer | null | undefined>(),
    [viewCustomer, setViewCustomer] = useState<Customer | null>(null),
    [deleteFunnel, setDeleteFunnel] = useState<CustomerFunnel | null>(null),
    [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null),
    [confirmBulkCustomerDelete, setConfirmBulkCustomerDelete] = useState(false),
    [viewFunnel, setViewFunnel] = useState<CustomerFunnel | null>(null),
    [selectedFunnels, setSelectedFunnels] = useState<string[]>([]),
    [importRows, setImportRows] = useState<ImportRow[] | null>(null),
    [demoImportOpen, setDemoImportOpen] = useState(false),
    [demoCount, setDemoCount] = useState(50),
    [importingDemo, setImportingDemo] = useState(false),
    [spendFormOpen, setSpendFormOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: funnels, isLoading: funnelsLoading, isFetching: funnelsFetching } = useGetFunnelsQuery();
  const {
    data: customers,
    isLoading: customersLoading,
    isFetching: customersFetching,
  } = useGetCustomersQuery({
    search,
    status,
    funnelId: funnelFilter || undefined,
    page,
    pageSize,
  });
  const { data: overview, isLoading: overviewLoading, isFetching: overviewFetching } = useGetCustomerOverviewQuery();
  const { data: spends, isLoading: spendsLoading, isFetching: spendsFetching } = useGetSpendsQuery();
  const [createFunnel, createFunnelState] = useCreateFunnelMutation();
  const [updateFunnel, updateFunnelState] = useUpdateFunnelMutation();
  const [removeFunnel, removeFunnelState] = useDeleteFunnelMutation();
  const [createCustomer, createCustomerState] = useCreateCustomerMutation();
  const [updateCustomer, updateCustomerState] = useUpdateCustomerMutation();
  const [bulkUpdate, bulkUpdateState] = useBulkUpdateCustomersMutation();
  const [bulkDelete, bulkDeleteState] = useBulkDeleteCustomersMutation();
  const [bulkDeleteFunnels, bulkDeleteFunnelsState] = useBulkDeleteFunnelsMutation();
  const [importCustomers, importState] = useImportCustomersMutation();
  const [importDemoCustomersWithOrders] = useImportDemoCustomersWithOrdersMutation();
  const [createSpend, createSpendState] = useCreateSpendMutation();
  const [createDemoSpends, createDemoSpendsState] = useCreateDemoSpendsMutation();
  const busy =
    createFunnelState.isLoading ||
    updateFunnelState.isLoading ||
    createCustomerState.isLoading ||
    updateCustomerState.isLoading;
  const totalPages = Math.max(1, Math.ceil((customers?.total ?? 0) / pageSize));
  const funnelItems = funnels?.items ?? [];
  const funnelTotalPages = Math.max(1, Math.ceil(funnelItems.length / funnelPageSize));
  const activeFunnelPage = Math.min(funnelPage, funnelTotalPages);
  const visibleFunnels = funnelItems.slice((activeFunnelPage - 1) * funnelPageSize, activeFunnelPage * funnelPageSize);
  const spendItems = spends?.items ?? [];
  const spendTotalPages = Math.max(1, Math.ceil(spendItems.length / spendPageSize));
  const activeSpendPage = Math.min(spendPage, spendTotalPages);
  const visibleSpends = spendItems.slice((activeSpendPage - 1) * spendPageSize, activeSpendPage * spendPageSize);
  const funnelsBusy = funnelsLoading || funnelsFetching;
  const customersBusy = customersLoading || customersFetching || funnelsFetching;
  const overviewBusy = overviewLoading || overviewFetching;
  const spendBusy = spendsLoading || spendsFetching || funnelsFetching;
  async function saveFunnel(
    form: Pick<CustomerFunnel, "name" | "description" | "minimumAmount" | "maximumAmount" | "color">,
  ) {
    try {
      if (funnelForm) await updateFunnel({ ...form, id: funnelForm.id, stages: [] }).unwrap();
      else await createFunnel({ ...form, stages: [] }).unwrap();
      setFunnelForm(undefined);
      toast.success("Funnel saved.");
    } catch (e) {
      toast.error(errorMessage(e, "Could not save funnel."));
    }
  }
  async function addDemo() {
    try {
      for (const [name, description, minimumAmount, maximumAmount, color] of demoFunnels)
        await createFunnel({ name, description, minimumAmount, maximumAmount, color, stages: [] }).unwrap();
      toast.success("Five demo funnels added.");
    } catch (e) {
      toast.error(errorMessage(e, "Could not add demo funnels."));
    }
  }
  async function moveFunnel(funnel: CustomerFunnel, direction: -1 | 1) {
    const items = funnels?.items ?? [];
    const index = items.findIndex((item) => item.id === funnel.id),
      swap = items[index + direction];
    if (!swap) return;
    try {
      await Promise.all([
        updateFunnel({ ...funnel, position: index + direction }).unwrap(),
        updateFunnel({ ...swap, position: index }).unwrap(),
      ]);
    } catch (error) {
      toast.error(errorMessage(error, "Could not change funnel position."));
    }
  }
  async function deleteSelectedFunnels() {
    try {
      const result = await bulkDeleteFunnels(selectedFunnels).unwrap();
      toast.success(`${result.deletedCount} funnels deleted.`);
      setSelectedFunnels([]);
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete selected funnels."));
    }
  }
  async function saveCustomer(form: Omit<Customer, "id" | "createdAt" | "updatedAt" | "metrics">) {
    try {
      if (customerForm) await updateCustomer({ ...form, id: customerForm.id }).unwrap();
      else await createCustomer(form).unwrap();
      setCustomerForm(undefined);
      toast.success("Customer saved.");
    } catch (e) {
      toast.error(errorMessage(e, "Could not save customer."));
    }
  }
  async function bulk(action: "update" | "delete") {
    try {
      const result =
        action === "update"
          ? await bulkUpdate({
              ids: selected,
              status: bulkStatus,
              funnelId: bulkFunnelId === "__unchanged" ? undefined : bulkFunnelId || null,
            }).unwrap()
          : await bulkDelete(selected).unwrap();
      toast.success(`${"updatedCount" in result ? result.updatedCount : result.deletedCount} customers ${action}d.`);
      setSelected([]);
      setBulkStatusOpen(false);
      if (action === "delete") setConfirmBulkCustomerDelete(false);
    } catch (e) {
      toast.error(errorMessage(e, "Bulk action failed."));
    }
  }
  async function removeCustomer() {
    if (!deleteCustomer) return;
    try {
      await bulkDelete([deleteCustomer.id]).unwrap();
      toast.success("Customer deleted.");
      setSelected((items) => items.filter((id) => id !== deleteCustomer.id));
      setDeleteCustomer(null);
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete customer."));
    }
  }
  function exportData() {
    const rows = (customers?.items ?? []).map(({ metrics, ...x }) => ({
      ...x,
      tags: x.tags.join(", "),
      amountSpent: metrics.amountSpent,
      purchaseCount: metrics.purchaseCount,
    }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Customers");
    XLSX.writeFile(book, "customers.xlsx");
  }
  async function readImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const book = XLSX.read(await file.arrayBuffer(), { type: "array" }),
        raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], { defval: "" });
      const rows = raw
        .map((row) => ({
          name: String(row.Name ?? row.name ?? "").trim(),
          mobileNumber: String(row.Number ?? row.number ?? row["Mobile Number"] ?? row.mobileNumber ?? "").trim(),
          email: String(row.Email ?? row.email ?? "").trim(),
          address: String(row.Address ?? row.address ?? "").trim(),
          whatsappNumber: String(row.WhatsApp ?? row.whatsappNumber ?? "").trim(),
          source: String(row.Source ?? row.source ?? "").trim(),
          author: String(row.Author ?? row.author ?? "").trim(),
          notes: String(row.Notes ?? row.notes ?? "").trim(),
          customerStatus: String(row.Status ?? row.customerStatus ?? "active").toLowerCase() as CustomerStatus,
          tags: String(row.Tags ?? row.tags ?? "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        }))
        .filter((x) => x.name && (x.mobileNumber || x.whatsappNumber || x.email));
      setImportRows(rows);
    } catch {
      toast.error("Could not read that Excel file.");
    } finally {
      event.target.value = "";
    }
  }
  async function confirmImport() {
    if (!importRows) return;
    try {
      const r = await importCustomers({ rows: importRows }).unwrap();
      toast.success(`${r.imported} customers imported; ${r.skipped} skipped.`);
      setImportRows(null);
    } catch (e) {
      toast.error(errorMessage(e, "Could not import customers."));
    }
  }
  async function importDemoCustomers() {
    setImportingDemo(true);
    try {
      let demoFunnelItems = funnels?.items ?? [];
      if (!demoFunnelItems.length) {
        const created = [] as CustomerFunnel[];
        for (const [name, description, minimumAmount, maximumAmount, color] of demoFunnels)
          created.push(
            await createFunnel({ name, description, minimumAmount, maximumAmount, color, stages: [] })
              .unwrap()
              .then((result) => result.item),
          );
        demoFunnelItems = created;
      }
      const stamp = Date.now();
      const funnelThresholds = [0.6, 0.9, 0.95, 0.98, 1];
      const rows: Partial<Customer>[] = Array.from({ length: demoCount }, (_, index) => {
        const ratioPosition = (index + 1) / demoCount;
        const funnelIndex = Math.min(
          demoFunnelItems.length - 1,
          funnelThresholds.findIndex((threshold) => ratioPosition <= threshold),
        );
        return {
          name: `Demo Customer ${index + 1}`,
          email: `demo.customer.${stamp}.${index + 1}@example.com`,
          mobileNumber: `017${String(stamp + index).slice(-8)}`,
          whatsappNumber: "",
          address: "",
          source: "Demo import",
          author: "Demo data",
          notes: "Generated demo customer.",
          tags: ["demo"],
          funnelId: demoFunnelItems[funnelIndex].id,
          customerStatus: customerStatuses[index % customerStatuses.length],
        };
      });
      const result = await importDemoCustomersWithOrders({ rows }).unwrap();
      toast.success(`${result.imported} demo customers and ${result.ordersCreated} product purchases imported.`);
      if (result.warning) toast.info(result.warning);
      setDemoImportOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Could not import demo customers."));
    } finally {
      setImportingDemo(false);
    }
  }
  async function saveSpend(form: { funnelId: string; amount: number }) {
    try {
      await createSpend(form).unwrap();
      setSpendFormOpen(false);
      toast.success("Marketing spend recorded.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not record marketing spend."));
    }
  }
  async function importDemoSpends() {
    try {
      const result = await createDemoSpends().unwrap();
      toast.success(`${result.createdCount} demo spend entries totaling ৳1,300 were added.`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not import demo spend."));
    }
  }
  return (
    <main className="min-h-[calc(100vh-65px)] flex-1 bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl rounded-sm border border-[#eadfca] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Customer management</h1>
            <p className="mt-1 text-sm text-stone-600">Organize customer journeys, contacts, and performance.</p>
          </div>
          {(tab === "funnels" || tab === "customers") && (
            <button
              className="primary-button"
              onClick={() => (tab === "funnels" ? setFunnelForm(null) : setCustomerForm(null))}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add {tab === "funnels" ? "funnel" : "customer"}
            </button>
          )}
        </div>
        <div className="mt-6 inline-flex rounded-sm border border-[#eadfca] bg-[#fffaf0] p-1">
          {(
            [
              ["funnels", "Funnels", Workflow],
              ["customers", "Customers", Users],
              ["spend", "Spend", Wallet],
              ["overview", "Overview", Users],
            ] as const
          ).map(([v, l, I]) => (
            <button
              className={`flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium ${tab === v ? "bg-amber-700 text-white" : "text-stone-600"}`}
              key={v}
              onClick={() => setTab(v)}
              type="button"
            >
              <I className="h-4 w-4" />
              {l}
            </button>
          ))}
        </div>
        {tab === "funnels" && (
          <section className="mt-5">
            {funnelsBusy && <LoadingState label="Loading funnels" overlay />}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-amber-200 bg-amber-50 p-4">
              <div>
                <h2 className="font-semibold text-stone-900">Customer funnels</h2>
                <p className="text-sm text-stone-600">Use amount ranges to segment each customer.</p>
              </div>
              {(funnels?.items.length ?? 0) <= 1 && (
                <button
                  className="secondary-button"
                  disabled={createFunnelState.isLoading}
                  onClick={() => void addDemo()}
                  type="button"
                >
                  {createFunnelState.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Add 5 demo data
                </button>
              )}
            </div>
            {selectedFunnels.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-sm border border-red-200 bg-red-50 p-3">
                <span className="text-sm font-medium">{selectedFunnels.length} funnels selected</span>
                <button
                  className="secondary-button border-red-200 text-red-700"
                  disabled={bulkDeleteFunnelsState.isLoading}
                  onClick={() => void deleteSelectedFunnels()}
                  type="button"
                >
                  {bulkDeleteFunnelsState.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Bulk delete
                </button>
              </div>
            )}
            <FunnelTable
              funnels={visibleFunnels}
              loading={funnelsLoading}
              edit={setFunnelForm}
              remove={setDeleteFunnel}
              view={setViewFunnel}
              selected={selectedFunnels}
              toggle={(id) =>
                setSelectedFunnels(
                  selectedFunnels.includes(id)
                    ? selectedFunnels.filter((item) => item !== id)
                    : [...selectedFunnels, id],
                )
              }
              toggleAll={(checked) => setSelectedFunnels(checked ? visibleFunnels.map((item) => item.id) : [])}
              move={moveFunnel}
            />
            <PaginationBar
              activePage={activeFunnelPage}
              isFetching={funnelsFetching}
              onPageChange={setFunnelPage}
              onPageSizeChange={(value) => {
                setFunnelPageSize(value);
                setFunnelPage(1);
              }}
              pageSize={funnelPageSize}
              total={funnelItems.length}
              totalPages={funnelTotalPages}
              noun="funnels"
            />
          </section>
        )}
        {tab === "customers" && (
          <section className="mt-5">
            {customersBusy && <LoadingState label="Loading customers" overlay />}
            <div className="grid gap-3 rounded-sm border border-[#eadfca] bg-[#fffdfa] p-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  className="input pl-9"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, email, or phone"
                  value={search}
                />
              </label>
              <button
                className="secondary-button"
                onClick={() => {
                  setDraftStatus(status);
                  setDraftFunnelFilter(funnelFilter);
                  setFilterOpen(true);
                }}
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </button>
              <button className="secondary-button" onClick={exportData} type="button">
                <Download className="h-4 w-4" />
                Export Excel
              </button>
              <button className="secondary-button" onClick={() => fileRef.current?.click()} type="button">
                <FileUp className="h-4 w-4" />
                Import Excel
              </button>
              <input accept=".xlsx,.xls" className="hidden" onChange={readImport} ref={fileRef} type="file" />
            </div>
            <CustomerTable
              customers={customers?.items ?? []}
              edit={setCustomerForm}
              funnels={funnels?.items ?? []}
              loading={customersLoading}
              remove={setDeleteCustomer}
              view={setViewCustomer}
            />
            {!customersLoading && !(customers?.total ?? 0) && (
              <div className="mt-4 rounded-sm border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
                <Users className="mx-auto h-7 w-7 text-amber-700" />
                <h2 className="mt-3 font-semibold text-stone-900">No customers found</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Import demo customers with product purchases assigned from their funnel.
                </p>
                <button className="primary-button mt-4" onClick={() => setDemoImportOpen(true)} type="button">
                  Import demo users
                </button>
              </div>
            )}
            <PaginationBar
              activePage={customers?.page ?? page}
              isFetching={customersFetching}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
                setSelected([]);
              }}
              pageSize={pageSize}
              total={customers?.total ?? 0}
              totalPages={totalPages}
              noun="customers"
            />
          </section>
        )}
        {tab === "overview" && (
          <>
            {overviewBusy && <LoadingState label="Loading customer overview" overlay />}
            <Overview data={overview} />
          </>
        )}
        {tab === "spend" && (
          <>
            {spendBusy && <LoadingState label="Loading marketing spend" overlay />}
            <SpendPanel
              funnels={funnels?.items ?? []}
              items={visibleSpends}
              totalItems={spendItems}
              loading={spendsLoading}
              openForm={() => setSpendFormOpen(true)}
              importDemo={() => void importDemoSpends()}
              importingDemo={createDemoSpendsState.isLoading}
            />
            <PaginationBar
              activePage={activeSpendPage}
              isFetching={spendsFetching}
              onPageChange={setSpendPage}
              onPageSizeChange={(value) => {
                setSpendPageSize(value);
                setSpendPage(1);
              }}
              pageSize={spendPageSize}
              total={spendItems.length}
              totalPages={spendTotalPages}
              noun="spend entries"
            />
          </>
        )}
      </section>
      {funnelForm !== undefined && (
        <FunnelModal busy={busy} close={() => setFunnelForm(undefined)} initial={funnelForm} save={saveFunnel} />
      )}{" "}
      {customerForm !== undefined && (
        <CustomerModal
          busy={busy}
          close={() => setCustomerForm(undefined)}
          funnels={funnels?.items ?? []}
          initial={customerForm}
          save={saveCustomer}
        />
      )}{" "}
      {viewCustomer && <CustomerDetails customer={viewCustomer} close={() => setViewCustomer(null)} />}
      {importRows && (
        <ImportPreview
          busy={importState.isLoading}
          cancel={() => setImportRows(null)}
          confirm={() => void confirmImport()}
          rows={importRows}
        />
      )}
      {demoImportOpen && (
        <DemoImportModal
          busy={importingDemo}
          count={demoCount}
          close={() => setDemoImportOpen(false)}
          confirm={() => void importDemoCustomers()}
          setCount={setDemoCount}
        />
      )}
      {spendFormOpen && (
        <SpendModal
          busy={createSpendState.isLoading}
          close={() => setSpendFormOpen(false)}
          funnels={funnels?.items ?? []}
          save={saveSpend}
        />
      )}
      {bulkStatusOpen && (
        <Dialog title="Update customer status">
          <p className="mt-2 text-sm text-stone-600">
            Choose the new status for {selected.length} selected customer{selected.length === 1 ? "" : "s"}.
          </p>
          <div className="wfull flex gap-2">
            <label className="w-full mt-5 block text-sm font-medium text-stone-700">
              <span className="mb-1 block">New status</span>
              <select
                className="input"
                onChange={(event) => setBulkStatus(event.target.value as CustomerStatus)}
                value={bulkStatus}
              >
                {customerStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="w-full mt-4 block text-sm font-medium text-stone-700">
              <span className="mb-1 block">Assign funnel</span>
              <select className="input" onChange={(event) => setBulkFunnelId(event.target.value)} value={bulkFunnelId}>
                <option value="__unchanged">Keep current funnel</option>
                <option value="">No funnel</option>
                {(funnels?.items ?? []).map((funnel) => (
                  <option key={funnel.id} value={funnel.id}>
                    {funnel.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              className="secondary-button"
              disabled={bulkUpdateState.isLoading}
              onClick={() => setBulkStatusOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="primary-button"
              disabled={bulkUpdateState.isLoading}
              onClick={() => void bulk("update")}
              type="button"
            >
              {bulkUpdateState.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Confirm update
            </button>
          </div>
        </Dialog>
      )}
      {filterOpen && (
        <Dialog title="Filter customers">
          <div className="mt-5 space-y-4">
            <Field label="Status">
              <select
                className="input"
                onChange={(event) => setDraftStatus((event.target.value || undefined) as CustomerStatus | undefined)}
                value={draftStatus ?? ""}
              >
                <option value="">All statuses</option>
                {customerStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Funnel">
              <select
                className="input"
                onChange={(event) => setDraftFunnelFilter(event.target.value)}
                value={draftFunnelFilter}
              >
                <option value="">All funnels</option>
                {(funnels?.items ?? []).map((funnel) => (
                  <option key={funnel.id} value={funnel.id}>
                    {funnel.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              className="secondary-button"
              onClick={() => {
                setDraftStatus(undefined);
                setDraftFunnelFilter("");
              }}
              type="button"
            >
              Clear
            </button>
            <button className="secondary-button" onClick={() => setFilterOpen(false)} type="button">
              Cancel
            </button>
            <button
              className="primary-button"
              onClick={() => {
                setStatus(draftStatus);
                setFunnelFilter(draftFunnelFilter);
                setPage(1);
                setFilterOpen(false);
              }}
              type="button"
            >
              Apply filter
            </button>
          </div>
        </Dialog>
      )}
      {viewFunnel && <FunnelDetails funnel={viewFunnel} close={() => setViewFunnel(null)} />}
      <AlertDialog
        busy={removeFunnelState.isLoading}
        confirmLabel="Delete funnel"
        description={deleteFunnel ? `Delete ${deleteFunnel.name}? Assigned customers will be unassigned.` : ""}
        onCancel={() => setDeleteFunnel(null)}
        onConfirm={() => {
          if (deleteFunnel)
            void removeFunnel(deleteFunnel.id)
              .unwrap()
              .then(() => setDeleteFunnel(null));
        }}
        open={Boolean(deleteFunnel)}
        title="Delete this funnel?"
      />
      <AlertDialog
        busy={bulkDeleteState.isLoading}
        confirmLabel="Delete customer"
        description={
          deleteCustomer ? `Delete ${deleteCustomer.name}? This permanently removes the customer record.` : ""
        }
        onCancel={() => setDeleteCustomer(null)}
        onConfirm={() => void removeCustomer()}
        open={Boolean(deleteCustomer)}
        title="Delete this customer?"
      />
      <AlertDialog
        busy={bulkDeleteState.isLoading}
        confirmLabel="Delete selected customers"
        description={`Delete ${selected.length} selected customer${selected.length === 1 ? "" : "s"}? This permanently removes their customer records.`}
        onCancel={() => setConfirmBulkCustomerDelete(false)}
        onConfirm={() => void bulk("delete")}
        open={confirmBulkCustomerDelete}
        title="Delete selected customers?"
      />
    </main>
  );
}

function PaginationBar({
  activePage,
  isFetching,
  onPageChange,
  onPageSizeChange,
  pageSize,
  total,
  totalPages,
  noun,
}: {
  activePage: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: (typeof pageSizes)[number]) => void;
  pageSize: number;
  total: number;
  totalPages: number;
  noun: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {total ? (activePage - 1) * pageSize + 1 : 0}–{Math.min(activePage * pageSize, total)} of {total} {noun}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span>Per page</span>
          <select
            aria-label={`${noun} per page`}
            className="h-9 rounded-sm border border-[#eadfca] bg-white px-2"
            onChange={(event) => onPageSizeChange(Number(event.target.value) as (typeof pageSizes)[number])}
            value={pageSize}
          >
            {pageSizes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          className="secondary-button"
          disabled={isFetching || activePage === 1}
          onClick={() => onPageChange(activePage - 1)}
          type="button"
        >
          Previous
        </button>
        <span className="min-w-20 text-center font-medium text-stone-800">
          Page {activePage} of {totalPages}
        </span>
        <button
          className="secondary-button"
          disabled={isFetching || activePage >= totalPages}
          onClick={() => onPageChange(activePage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function FunnelTable({
  funnels,
  loading,
  edit,
  remove,
  view,
  selected,
  toggle,
  toggleAll,
  move,
}: {
  funnels: CustomerFunnel[];
  loading: boolean;
  edit: (x: CustomerFunnel) => void;
  remove: (x: CustomerFunnel) => void;
  view: (x: CustomerFunnel) => void;
  selected: string[];
  toggle: (id: string) => void;
  toggleAll: (checked: boolean) => void;
  move: (funnel: CustomerFunnel, direction: -1 | 1) => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-[#eadfca] text-stone-500">
          <tr>
            <th className="p-3">
              <input
                aria-label="Select all funnels"
                checked={funnels.length > 0 && funnels.every((funnel) => selected.includes(funnel.id))}
                onChange={(event) => toggleAll(event.target.checked)}
                type="checkbox"
              />
            </th>
            <th className="p-3">Position</th>
            <th className="p-3">Name</th>
            <th className="p-3">Description</th>
            <th className="p-3">Minimum amount</th>
            <th className="p-3">Maximum amount</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="p-6" colSpan={7}>
                Loading funnels…
              </td>
            </tr>
          ) : (
            funnels.map((x, index) => (
              <tr className="border-b border-stone-100" key={x.id}>
                <td className="p-3">
                  <input
                    aria-label={`Select ${x.name}`}
                    checked={selected.includes(x.id)}
                    onChange={() => toggle(x.id)}
                    type="checkbox"
                  />
                </td>
                <td className="p-3 font-semibold text-amber-800">{index + 1}</td>
                <td className="p-3 font-medium">
                  <span
                    className="mr-2 inline-block h-3 w-3 rounded-full align-middle"
                    style={{ backgroundColor: x.color }}
                  />
                  {x.name}
                </td>
                <td className="p-3 text-stone-600">{x.description || "—"}</td>
                <td className="p-3">৳{x.minimumAmount}</td>
                <td className="p-3">{x.maximumAmount == null ? "—" : `৳${x.maximumAmount}`}</td>
                <td className="p-3 text-right flex gap-2 justify-end">
                  <button
                    aria-label={`Move ${x.name} up`}
                    className="icon-button"
                    disabled={index === 0}
                    onClick={() => move(x, -1)}
                    type="button"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Move ${x.name} down`}
                    className="icon-button ml-1"
                    disabled={index === funnels.length - 1}
                    onClick={() => move(x, 1)}
                    type="button"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button className="icon-button" onClick={() => view(x)} type="button">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="icon-button" onClick={() => edit(x)} type="button">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="icon-button ml-1 text-red-700" onClick={() => remove(x)} type="button">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
function CustomerTable({
  customers,
  edit,
  funnels,
  loading,
  remove,
  view,
}: {
  customers: Customer[];
  edit: (customer: Customer) => void;
  funnels: CustomerFunnel[];
  loading: boolean;
  remove: (customer: Customer) => void;
  view: (customer: Customer) => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-sm border border-[#eadfca]">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-[#fffdfa] text-stone-500">
          <tr>
            <th className="p-3">Customer</th>
            <th className="p-3">Contact</th>
            <th className="p-3">Funnel</th>
            <th className="p-3">Status</th>
            <th className="p-3">Spent</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="p-6" colSpan={6}>
                Loading customers…
              </td>
            </tr>
          ) : (
            customers.map((x) => (
              <tr className="border-t border-stone-100" key={x.id}>
                <td className="p-3 font-medium">{x.name}</td>
                <td className="p-3 text-stone-600">{x.mobileNumber || x.whatsappNumber || x.email}</td>
                <td className="p-3">
                  {(() => {
                    const funnel = funnels.find((item) => item.id === x.funnelId);
                    return funnel ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium"
                        style={{ backgroundColor: `${funnel.color}22`, color: funnel.color }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: funnel.color }} />
                        {funnel.name}
                      </span>
                    ) : (
                      "—"
                    );
                  })()}
                </td>
                <td className="p-3">
                  <span className={`rounded-sm px-2 py-1 text-xs font-medium ${customerStatusClass(x.customerStatus)}`}>
                    {x.customerStatus}
                  </span>
                </td>
                <td className="p-3">৳{x.metrics.amountSpent}</td>
                <td className="p-3 text-right">
                  <button aria-label={`View ${x.name}`} className="icon-button" onClick={() => view(x)} type="button">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Edit ${x.name}`}
                    className="icon-button ml-1"
                    onClick={() => edit(x)}
                    type="button"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Delete ${x.name}`}
                    className="icon-button ml-1 border-red-100 text-red-700 hover:bg-red-50"
                    onClick={() => remove(x)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
function customerStatusClass(status: CustomerStatus) {
  return {
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-stone-200 text-stone-700",
  }[status];
}
function SpendPanel({
  funnels,
  items,
  totalItems,
  loading,
  openForm,
  importDemo,
  importingDemo,
}: {
  funnels: CustomerFunnel[];
  items: CustomerSpend[];
  totalItems: CustomerSpend[];
  loading: boolean;
  openForm: () => void;
  importDemo: () => void;
  importingDemo: boolean;
}) {
  const total = totalItems.reduce((sum, item) => sum + item.amount, 0);
  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#eadfca] bg-[#fffdfa] p-4">
        <div>
          <h2 className="font-semibold text-stone-900">Marketing spend</h2>
          <p className="mt-1 text-sm text-stone-600">Record each marketing cost against a funnel.</p>
        </div>
        <button className="primary-button" disabled={!funnels.length} onClick={openForm} type="button">
          <Plus className="h-4 w-4" />
          Add spend
        </button>
      </div>
      {!funnels.length && (
        <p className="mt-3 rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Create a funnel before recording marketing spend.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Summary label="Total recorded spend" value={total} prefix="৳" />
        <Summary label="Spend entries" value={totalItems.length} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-sm border border-[#eadfca]">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-[#fffdfa] text-stone-500">
            <tr>
              <th className="p-3">Funnel</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Recorded date & time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6" colSpan={3}>
                  Loading spend history…
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr className="border-t border-stone-100" key={item.id}>
                  <td className="p-3 font-medium">
                    {funnels.find((funnel) => funnel.id === item.funnelId)?.name ?? "Deleted funnel"}
                  </td>
                  <td className="p-3">৳{item.amount.toLocaleString()}</td>
                  <td className="p-3 text-stone-600">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
                      new Date(item.createdAt),
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6 text-center text-stone-600" colSpan={3}>
                  <p>No marketing spend recorded yet.</p>
                  <button
                    className="secondary-button mt-3"
                    disabled={importingDemo || funnels.length < 5}
                    onClick={importDemo}
                    type="button"
                  >
                    {importingDemo && <Loader2 className="h-4 w-4 animate-spin" />}Import 14 demo spends (৳1,300)
                  </button>
                  {funnels.length < 5 && (
                    <p className="mt-2 text-xs text-amber-800">Create all five funnels to use the demo split.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function SpendModal({
  funnels,
  close,
  save,
  busy,
}: {
  funnels: CustomerFunnel[];
  close: () => void;
  save: (form: { funnelId: string; amount: number }) => Promise<void>;
  busy: boolean;
}) {
  const [funnelId, setFunnelId] = useState(funnels[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  return (
    <Dialog title="Add marketing spend">
      <form
        className="mt-5 space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void save({ funnelId, amount: Number(amount) });
        }}
      >
        <Field label="Amount">
          <input
            autoFocus
            className="input"
            min="1"
            onChange={(event) => setAmount(event.target.value)}
            required
            type="number"
            value={amount}
          />
        </Field>
        <Field label="Funnel">
          <select className="input" onChange={(event) => setFunnelId(event.target.value)} required value={funnelId}>
            {funnels.map((funnel) => (
              <option key={funnel.id} value={funnel.id}>
                {funnel.name}
              </option>
            ))}
          </select>
        </Field>
        <p className="rounded-sm bg-stone-100 p-3 text-sm text-stone-600">
          Date and time are recorded automatically when you save.
        </p>
        <div className="flex justify-end gap-2">
          <button className="secondary-button" disabled={busy} onClick={close} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Save spend
          </button>
        </div>
      </form>
    </Dialog>
  );
}
function Overview({
  data,
}: {
  data?: {
    total: number;
    statuses: { _id: CustomerStatus; count: number }[];
    funnels: { id: string; name: string; count: number; spend: number; estimatedReturn: number }[];
    unassigned: number;
    monthly: { label: string; count: number }[];
    newLast30: number;
    newPrevious30: number;
  };
}) {
  const total = data?.total ?? 0;
  const active = data?.statuses.find((item) => item._id === "active")?.count ?? 0;
  const chartMax = Math.max(...(data?.monthly.map((item) => item.count) ?? [0]), 1);
  const growth = data?.newPrevious30
    ? Math.round(((data.newLast30 - data.newPrevious30) / data.newPrevious30) * 100)
    : data?.newLast30
      ? 100
      : 0;
  const totalSpend = data?.funnels.reduce((sum, funnel) => sum + funnel.spend, 0) ?? 0;
  const totalReturn = data?.funnels.reduce((sum, funnel) => sum + funnel.estimatedReturn, 0) ?? 0;
  return (
    <section className="mt-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="All customers" value={total} />
        <Summary label="New in 30 days" value={data?.newLast30 ?? 0} />
        <Summary label="Active customers" value={active} />
        <Summary label="Active rate" value={total ? Math.round((active / total) * 100) : 0} suffix="%" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-sm border border-[#eadfca] bg-[#fffdfa] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-stone-900">Customer growth</h2>
              <p className="mt-1 text-sm text-stone-600">New customers over the last six months.</p>
            </div>
            <span
              className={`rounded-sm px-2 py-1 text-sm font-semibold ${growth >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
            >
              {growth >= 0 ? "+" : ""}
              {growth}%
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-3 border-b border-[#eadfca] pb-1">
            {(data?.monthly ?? []).map((item) => (
              <div className="flex h-full flex-1 flex-col justify-end gap-2 text-center" key={item.label}>
                <span className="text-xs font-medium text-stone-600">{item.count}</span>
                <div
                  className="min-h-1 rounded-t-sm bg-amber-600"
                  style={{ height: `${Math.max(3, (item.count / chartMax) * 100)}%` }}
                />
                <span className="text-xs text-stone-500">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-sm border border-[#eadfca] bg-[#fffdfa] p-4">
          <h2 className="font-semibold text-stone-900">Business growth facts</h2>
          <div className="mt-4 space-y-4">
            <Fact label="New vs. previous 30 days" value={`${growth >= 0 ? "+" : ""}${growth}%`} />
            <Fact label="Customers in funnels" value={`${total - (data?.unassigned ?? 0)} / ${total}`} />
            <Fact label="Unassigned customers" value={String(data?.unassigned ?? 0)} />
            <Fact
              label="Best funnel"
              value={
                data?.funnels.reduce(
                  (best, funnel) => (funnel.count > (best?.count ?? 0) ? funnel : best),
                  undefined as { name: string; count: number } | undefined,
                )?.name ?? "—"
              }
            />
          </div>
        </section>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm border border-[#eadfca] bg-white p-4">
          <h2 className="font-semibold text-stone-900">Customer status distribution</h2>
          <div className="mt-4 space-y-3">
            {customerStatuses.map((status) => {
              const count = data?.statuses.find((item) => item._id === status)?.count ?? 0;
              return (
                <Bar
                  key={status}
                  label={status}
                  value={count}
                  max={total}
                  color={status === "active" ? "#10b981" : "#78716c"}
                />
              );
            })}
          </div>
        </section>
        <section className="rounded-sm border border-[#eadfca] bg-white p-4">
          <h2 className="font-semibold text-stone-900">Customers by funnel</h2>
          <div className="mt-4 space-y-3">
            {data?.funnels.map((funnel) => (
              <Bar key={funnel.id} label={funnel.name} value={funnel.count} max={total} color="#d97706" />
            ))}
            <Bar label="Unassigned" value={data?.unassigned ?? 0} max={total} color="#a8a29e" />
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-sm border border-[#eadfca] bg-white p-4">
        <div>
          <h2 className="font-semibold text-stone-900">Funnel spend &amp; return</h2>
          <p className="mt-1 text-sm text-stone-600">
            Return is the average of the funnel&apos;s configured amount range. An incomplete range is shown as 0 BDT.
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Summary label="Total spend" suffix=" BDT" value={totalSpend} />
          <Summary label="Total return from averages" suffix=" BDT" value={totalReturn} />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-[#eadfca] text-stone-500">
              <tr>
                <th className="p-3">Funnel</th>
                <th className="p-3 text-right">Customers</th>
                <th className="p-3 text-right">Spend</th>
                <th className="p-3 text-right">Average return</th>
              </tr>
            </thead>
            <tbody>
              {(data?.funnels ?? []).map((funnel) => (
                <tr className="border-b border-stone-100 last:border-0" key={funnel.id}>
                  <td className="p-3 font-medium text-stone-900">{funnel.name}</td>
                  <td className="p-3 text-right text-stone-600">{funnel.count}</td>
                  <td className="p-3 text-right font-medium">{formatBDT(funnel.spend)}</td>
                  <td className="p-3 text-right font-medium text-emerald-700">{formatBDT(funnel.estimatedReturn)}</td>
                </tr>
              ))}
              {!data?.funnels.length && (
                <tr>
                  <td className="p-6 text-center text-stone-600" colSpan={4}>
                    No funnels to report yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
function formatBDT(value: number) {
  return `${Math.max(0, Math.round(value || 0)).toLocaleString("en-BD")} BDT`;
}
function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="capitalize text-stone-700">{label}</span>
        <strong>
          {value} <span className="font-normal text-stone-500">({percent}%)</span>
        </strong>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-stone-100">
        <div
          className="h-full rounded-sm"
          style={{ backgroundColor: color, width: `${max ? Math.max(2, (value / max) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3 text-sm">
      <span className="text-stone-600">{label}</span>
      <strong className="text-right text-stone-900">{value}</strong>
    </div>
  );
}
function Summary({
  label,
  value,
  suffix = "",
  prefix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div className="rounded-sm border border-[#eadfca] bg-[#fffdfa] p-4">
      <p className="text-sm capitalize text-stone-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </p>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
function Dialog({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/35 p-4">
      <section className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-sm bg-[#fffaf0] p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
      </section>
    </div>
  );
}
function FunnelModal({
  initial,
  close,
  save,
  busy,
}: {
  initial: CustomerFunnel | null;
  close: () => void;
  save: (
    x: Pick<CustomerFunnel, "name" | "description" | "minimumAmount" | "maximumAmount" | "color">,
  ) => Promise<void>;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    minimumAmount: initial?.minimumAmount ?? 0,
    maximumAmount: initial?.maximumAmount?.toString() ?? "",
    color: initial?.color ?? "#d97706",
  });
  return (
    <Dialog title={initial ? "Edit funnel" : "Create funnel"}>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save({
            ...form,
            minimumAmount: Number(form.minimumAmount),
            maximumAmount: form.maximumAmount === "" ? null : Number(form.maximumAmount),
          });
        }}
      >
        <Field label="Name">
          <input
            autoFocus
            className="input"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            value={form.name}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="input min-h-24"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            value={form.description}
          />
        </Field>
        <Field label="Minimum amount">
          <input
            className="input"
            min="0"
            onChange={(e) => setForm({ ...form, minimumAmount: Number(e.target.value) })}
            required
            type="number"
            value={form.minimumAmount}
          />
        </Field>
        <Field label="Maximum amount (optional)">
          <input
            className="input"
            min={form.minimumAmount}
            onChange={(e) => setForm({ ...form, maximumAmount: e.target.value })}
            type="number"
            value={form.maximumAmount}
          />
        </Field>
        <Field label="Funnel color">
          <div className="flex items-center gap-3">
            <input
              aria-label="Funnel color"
              className="h-10 w-14 rounded-sm border border-[#eadfca] bg-white p-1"
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              type="color"
              value={form.color}
            />
            <span className="text-sm text-stone-600">{form.color}</span>
          </div>
        </Field>
        <div className="flex justify-end gap-2">
          <button className="secondary-button" onClick={close} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Save funnel
          </button>
        </div>
      </form>
    </Dialog>
  );
}
function FunnelDetails({ funnel, close }: { funnel: CustomerFunnel; close: () => void }) {
  return (
    <Dialog title="Funnel details">
      <dl className="mt-5 space-y-3 text-sm">
        <Detail label="Position" value={String(funnel.position + 1)} />
        <Detail label="Color" value={funnel.color} />
        <Detail label="Name" value={funnel.name} />
        <Detail label="Description" value={funnel.description || "—"} />
        <Detail label="Minimum amount" value={`৳${funnel.minimumAmount}`} />
        <Detail
          label="Maximum amount"
          value={funnel.maximumAmount == null ? "No maximum" : `৳${funnel.maximumAmount}`}
        />
        <Detail
          label="Created"
          value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(funnel.createdAt),
          )}
        />
        <Detail
          label="Last updated"
          value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(funnel.updatedAt),
          )}
        />
      </dl>
      <div className="mt-5 flex justify-end">
        <button className="secondary-button" onClick={close} type="button">
          Close
        </button>
      </div>
    </Dialog>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-stone-100 pb-3">
      <dt className="font-medium text-stone-600">{label}</dt>
      <dd className="text-stone-900">{value}</dd>
    </div>
  );
}
function CustomerDetails({ customer, close }: { customer: Customer; close: () => void }) {
  return (
    <Dialog title="Customer details">
      <dl className="mt-5 space-y-3 text-sm">
        <Detail label="Name" value={customer.name} />
        <Detail label="Contact" value={customer.mobileNumber || customer.whatsappNumber || customer.email} />
        <Detail label="Email" value={customer.email || "—"} />
        <Detail label="Address" value={customer.address || "—"} />
        <Detail label="Status" value={customer.customerStatus} />
        <Detail label="Purchase count" value={String(customer.metrics.purchaseCount)} />
        <Detail label="Total spent" value={formatBDT(customer.metrics.amountSpent)} />
      </dl>
      <div className="mt-5 flex justify-end">
        <button className="secondary-button" onClick={close} type="button">
          Close
        </button>
      </div>
    </Dialog>
  );
}
function CustomerModal({
  initial,
  funnels,
  close,
  save,
  busy,
}: {
  initial: Customer | null;
  funnels: CustomerFunnel[];
  close: () => void;
  save: (x: Omit<Customer, "id" | "createdAt" | "updatedAt" | "metrics">) => Promise<void>;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    mobileNumber: initial?.mobileNumber ?? "",
    email: initial?.email ?? "",
    funnelId: initial?.funnelId ?? "",
    customerStatus: (initial?.customerStatus === "inactive" ? "inactive" : "active") as CustomerStatus,
  });
  return (
    <Dialog title={initial ? "Edit customer" : "Create customer"}>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save({
            ...form,
            funnelId: form.funnelId || null,
            address: initial?.address ?? "",
            whatsappNumber: initial?.whatsappNumber ?? "",
            source: initial?.source ?? "",
            author: initial?.author ?? "",
            notes: initial?.notes ?? "",
            tags: initial?.tags ?? [],
          });
        }}
      >
        <Field label="Name">
          <input
            autoFocus
            className="input"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            value={form.name}
          />
        </Field>
        <Field label="Mobile number or email">
          <input
            className="input"
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
            required={!form.email}
            value={form.mobileNumber}
          />
        </Field>
        <Field label="Email (optional)">
          <input
            className="input"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
            value={form.email}
          />
        </Field>
        <Field label="Funnel">
          <select
            className="input"
            onChange={(e) => setForm({ ...form, funnelId: e.target.value })}
            value={form.funnelId}
          >
            <option value="">Unassigned</option>
            {funnels.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className="input"
            onChange={(e) => setForm({ ...form, customerStatus: e.target.value as CustomerStatus })}
            value={form.customerStatus}
          >
            {customerStatuses.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2">
          <button className="secondary-button" onClick={close} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            Save customer
          </button>
        </div>
      </form>
    </Dialog>
  );
}
function ImportPreview({
  rows,
  cancel,
  confirm,
  busy,
}: {
  rows: ImportRow[];
  cancel: () => void;
  confirm: () => void;
  busy: boolean;
}) {
  return (
    <Dialog title="Check Excel import">
      <p className="mt-2 text-sm text-stone-600">
        {rows.length} valid rows found. Name plus a phone number (or email) is enough; other fields can stay empty.
      </p>
      <div className="mt-4 max-h-48 overflow-auto rounded-sm border border-[#eadfca]">
        <table className="w-full text-sm">
          <tbody>
            {rows.slice(0, 10).map((x, i) => (
              <tr className="border-b border-stone-100" key={i}>
                <td className="p-2">{x.name}</td>
                <td className="p-2">{x.mobileNumber || x.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="secondary-button" onClick={cancel} type="button">
          Cancel
        </button>
        <button className="primary-button" disabled={busy} onClick={confirm} type="button">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}Import {rows.length} customers
        </button>
      </div>
    </Dialog>
  );
}
function DemoImportModal({
  count,
  setCount,
  close,
  confirm,
  busy,
}: {
  count: number;
  setCount: (value: number) => void;
  close: () => void;
  confirm: () => void;
  busy: boolean;
}) {
  return (
    <Dialog title="Import demo users">
      <p className="mt-2 text-sm text-stone-600">
        Choose how many demo customers to create. They will be distributed across your funnels and customer statuses.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[50, 100, 150, 200].map((value) => (
          <button
            className={`rounded-sm border p-3 text-sm font-semibold ${count === value ? "border-amber-700 bg-amber-700 text-white" : "border-[#eadfca] bg-white text-stone-700"}`}
            key={value}
            onClick={() => setCount(value)}
            type="button"
          >
            {value} users
          </button>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="secondary-button" disabled={busy} onClick={close} type="button">
          Cancel
        </button>
        <button className="primary-button" disabled={busy} onClick={confirm} type="button">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}Import {count} users
        </button>
      </div>
    </Dialog>
  );
}
