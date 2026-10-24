/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

"use client";

import { ChevronDown, Eye, Loader2, Pencil, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useState } from "react";

import { useConfirmDelete } from "@/components/confirm-delete-provider";
import OrderDetailModal from "@/components/dashboard-ui/OrderDetailModal";
import OrderLimitModal from "@/components/dashboard-ui/OrderLimitModal";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/global-toast";
import { orderStatuses, type OrderStatus } from "@/lib/dashboard/orders";
import { useGetOrderSettingsQuery } from "@/redux/features/dashboard/orders/orderSettingsSlice";
import {
  type OrderItem,
  useBulkDeleteOrdersMutation,
  useBulkUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/features/dashboard/orders/ordersSlice";

const bdt = (value: number) => `৳${value.toLocaleString("en-BD")}`;
const pageSizes = [10, 25, 50, 100] as const;
const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const statusTone: Record<OrderStatus, string> = {
  incomplete: "bg-stone-100 text-stone-700 ring-stone-200",
  placed: "bg-amber-100 text-amber-900 ring-amber-200",
  confirmed: "bg-sky-100 text-sky-900 ring-sky-200",
  processing: "bg-violet-100 text-violet-900 ring-violet-200",
  completed: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  cancelled: "bg-red-100 text-red-800 ring-red-200",
};
const errorMessage = (error: unknown) =>
  typeof error === "object" &&
  error &&
  "data" in error &&
  typeof (error as { data?: { error?: string } }).data?.error === "string"
    ? (error as { data: { error: string } }).data.error
    : "Could not load orders.";

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(10);
  const { data, error, isFetching, isLoading, refetch } = useGetOrdersQuery({
    status: status || undefined,
    search,
    page,
    pageSize,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("confirmed");
  const [editing, setEditing] = useState<OrderItem | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);
  const [orderLimitOpen, setOrderLimitOpen] = useState(false);

  const { data: settingsData } = useGetOrderSettingsQuery();
  const orderSettings = settingsData?.settings;
  const [remove] = useDeleteOrderMutation();
  const [bulkRemove, bulkRemoveState] = useBulkDeleteOrdersMutation();
  const [bulkUpdateStatus, bulkUpdateStatusState] = useBulkUpdateOrderStatusMutation();
  const [updateStatus, updateStatusState] = useUpdateOrderStatusMutation();
  const confirmDelete = useConfirmDelete();
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const activePage = data?.page ?? page;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const busy = bulkRemoveState.isLoading || bulkUpdateStatusState.isLoading || updateStatusState.isLoading;
  const updateFilter = (value: OrderStatus | "") => {
    setSelectedIds([]);
    setStatus(value);
    setPage(1);
  };
  const updateSearch = (value: string) => {
    setSelectedIds([]);
    setSearch(value);
    setPage(1);
  };
  const updatePageSize = (value: (typeof pageSizes)[number]) => {
    setSelectedIds([]);
    setPageSize(value);
    setPage(1);
  };
  const toggle = (id: string, checked: boolean) =>
    setSelectedIds((current) => (checked ? [...new Set([...current, id])] : current.filter((value) => value !== id)));

  async function deleteOrder(order: OrderItem) {
    if (!(await confirmDelete(`Delete order ${order.id}? This cannot be undone.`))) return;
    try {
      await remove(order.id).unwrap();
      setSelectedIds((current) => current.filter((id) => id !== order.id));
      toast.success("Order deleted successfully.");
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (
      !(await confirmDelete(
        `Delete ${selectedIds.length} selected order${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`,
      ))
    )
      return;
    try {
      const result = await bulkRemove(selectedIds).unwrap();
      setSelectedIds([]);
      toast.success(`${result.deletedCount} order${result.deletedCount === 1 ? "" : "s"} deleted successfully.`);
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  }

  async function updateSelected() {
    if (!selectedIds.length) return;
    try {
      const result = await bulkUpdateStatus({ ids: selectedIds, status: bulkStatus }).unwrap();
      setSelectedIds([]);
      toast.success(`${result.updatedCount} order${result.updatedCount === 1 ? "" : "s"} updated to ${bulkStatus}.`);
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  }

  return (
    <main className="min-h-[calc(100vh-65px)] flex-1 bg-[#fffaf0] px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
      <section className="mx-auto max-w-7xl rounded-sm border border-[#eadfca] bg-white p-4 shadow-[0_16px_40px_-30px_rgba(120,53,15,.35)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-stone-900">Orders</h1>
            <p className="mt-1 text-sm text-stone-600">Server-calculated customer orders and fulfilment status.</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              className="secondary-button flex flex-1 items-center justify-center gap-1.5 sm:flex-none"
              onClick={() => setOrderLimitOpen(true)}
              type="button"
            >
              <span>Order limit</span>
              {orderSettings?.orderLimitEnabled ? (
                <span className="rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  {orderSettings.orderLimitMaxOrders}/{orderSettings.orderLimitMinutes}m
                </span>
              ) : null}
            </button>
            <button
              className="secondary-button flex-1 sm:flex-none"
              disabled={isFetching}
              onClick={() => void refetch()}
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="mt-5 grid max-w-2xl gap-3 rounded-sm border border-[#eadfca] bg-[#fffaf0] p-3 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-medium text-stone-700">
            <span>Search order ID</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-amber-700" />
              <input
                aria-label="Search order ID"
                className="input bg-white pl-9"
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="e.g. AB-1234"
                value={search}
              />
            </span>
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-stone-700">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-amber-700" /> Status
              {isFetching ? (
                <Loader2 aria-label="Loading orders" className="size-3.5 animate-spin text-amber-700" />
              ) : null}
            </span>
            <span className="relative block">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-amber-700" />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
              <select
                className="h-10 w-full appearance-none rounded-sm border border-[#eadfca] bg-white px-3 pl-9 text-sm text-stone-800 outline-none transition duration-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                onChange={(event) => updateFilter(event.target.value as OrderStatus | "")}
                value={status}
              >
                <option value="">All statuses</option>
                {orderStatuses.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
        {selectedIds.length ? (
          <div className="mt-4 flex flex-col gap-3 rounded-sm border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-amber-950">
              {selectedIds.length} order{selectedIds.length === 1 ? "" : "s"} selected
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <select
                aria-label="Bulk order status"
                className="col-span-2 h-9 rounded-sm border border-amber-200 bg-white px-3 text-sm sm:col-auto"
                onChange={(event) => setBulkStatus(event.target.value as OrderStatus)}
                value={bulkStatus}
              >
                {orderStatuses.map((value) => (
                  <option key={value} value={value}>
                    Set {value}
                  </option>
                ))}
              </select>
              <button className="secondary-button" disabled={busy} onClick={() => void updateSelected()} type="button">
                Update status
              </button>
              <button
                className="secondary-button border-red-200 text-red-700 hover:bg-red-50"
                disabled={busy}
                onClick={() => void deleteSelected()}
                type="button"
              >
                Delete selected
              </button>
            </div>
          </div>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage(error)}
          </p>
        ) : null}
        {isLoading ? (
          <div className="mt-5 grid gap-3" role="status">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-24 animate-pulse rounded-sm bg-amber-50" key={index} />
            ))}
          </div>
        ) : null}
        {!isLoading && !items.length ? (
          <div className="mt-5 rounded-sm border border-dashed border-[#d9c9aa] p-10 text-center text-sm text-stone-500">
            No orders found.
          </div>
        ) : null}
        {items.length ? (
          <>
            <div aria-busy={isFetching} className="relative mt-5 space-y-3 md:hidden">
              {isFetching ? (
                <div className="absolute inset-0 z-10 grid place-items-center rounded-sm bg-white/75" role="status">
                  <span className="inline-flex items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm">
                    <Loader2 className="size-4 animate-spin" /> Loading orders…
                  </span>
                </div>
              ) : null}
              {items.map((order) => (
                <article
                  className="rounded-sm border border-[#eadfca] bg-white p-3.5 shadow-[0_8px_20px_-18px_rgba(120,53,15,.45)]"
                  key={order.id}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      aria-label={`Select order ${order.id}`}
                      checked={selectedIds.includes(order.id)}
                      onCheckedChange={(checked) => toggle(order.id, checked)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          className="min-w-0 cursor-pointer truncate text-left font-mono text-xs font-semibold text-amber-800 hover:underline"
                          onClick={() => setViewingOrder(order)}
                          type="button"
                        >
                          {order.id}
                        </button>
                        <span
                          className={`shrink-0 rounded-sm px-2 py-1 text-[11px] font-semibold capitalize ring-1 ${statusTone[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-2 truncate font-medium text-stone-900">{order.customer.name}</p>
                      <p className="truncate text-xs text-stone-500">{order.customer.email || "No email provided"}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-sm bg-[#fffaf0] px-3 py-2.5 text-xs text-stone-600">
                    <p className="font-medium text-stone-800">
                      {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 line-clamp-2">
                      {order.items.map((item) => `${item.name} × ${item.quantity}`).join(" · ")}
                    </p>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-stone-900">{bdt(order.total)}</p>
                      <p className="mt-0.5 text-[11px] text-stone-500">{displayDate(order.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        aria-label={`View order ${order.id}`}
                        className="grid size-9 cursor-pointer place-items-center rounded-sm border border-amber-200 bg-amber-50 text-amber-800 transition duration-700 hover:bg-amber-100 hover:text-amber-950"
                        onClick={() => setViewingOrder(order)}
                        title="View order"
                        type="button"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        aria-label={`Edit status for ${order.id}`}
                        className="grid size-9 cursor-pointer place-items-center rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-800 transition duration-700 hover:bg-emerald-100 hover:text-emerald-950"
                        onClick={() => setEditing(order)}
                        title="Edit status"
                        type="button"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        aria-label={`Delete order ${order.id}`}
                        className="grid size-9 cursor-pointer place-items-center rounded-sm border border-red-200 bg-red-50 text-red-700 transition duration-700 hover:bg-red-100 hover:text-red-800"
                        onClick={() => void deleteOrder(order)}
                        title="Delete order"
                        type="button"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div
              aria-busy={isFetching}
              className="relative mt-5 hidden overflow-x-auto rounded-sm border border-[#eadfca] md:block"
            >
              {isFetching ? (
                <div className="absolute inset-0 z-10 grid place-items-center bg-white/65" role="status">
                  <span className="inline-flex items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm">
                    <Loader2 className="size-4 animate-spin" /> Loading orders…
                  </span>
                </div>
              ) : null}
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-[#fffaf0] text-stone-600">
                  <tr>
                    <th className="w-12 p-3">
                      <Checkbox
                        aria-label="Select all orders"
                        checked={allSelected}
                        onCheckedChange={(checked) => setSelectedIds(checked ? items.map((item) => item.id) : [])}
                      />
                    </th>
                    <th className="p-3">Order</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Products</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((order) => (
                    <tr className="border-t border-stone-100 align-top" key={order.id}>
                      <td className="p-3">
                        <Checkbox
                          aria-label={`Select order ${order.id}`}
                          checked={selectedIds.includes(order.id)}
                          onCheckedChange={(checked) => toggle(order.id, checked)}
                        />
                      </td>
                      <td className="p-3">
                        <button
                          className="cursor-pointer font-mono text-xs font-semibold text-amber-800 hover:underline text-left"
                          onClick={() => setViewingOrder(order)}
                          type="button"
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-stone-900">{order.customer.name}</p>
                        <p className="text-xs text-stone-500">{order.customer.email}</p>
                      </td>
                      <td className="p-3">
                        <ul className="space-y-1">
                          {order.items.map((item) => (
                            <li key={item.productId}>
                              {item.name} · {bdt(item.unitPrice)} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 font-semibold text-stone-900">{bdt(order.total)}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold capitalize ring-1 ${statusTone[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-600">{displayDate(order.createdAt)}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            aria-label={`View order ${order.id}`}
                            className="grid size-8 cursor-pointer place-items-center rounded-sm border border-amber-200 bg-amber-50 text-amber-800 transition duration-700 hover:bg-amber-100 hover:text-amber-950"
                            onClick={() => setViewingOrder(order)}
                            title="View order"
                            type="button"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            aria-label={`Edit status for ${order.id}`}
                            className="grid size-8 place-items-center rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-800 transition duration-700 hover:bg-emerald-100 hover:text-emerald-950"
                            onClick={() => setEditing(order)}
                            title="Edit status"
                            type="button"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            aria-label={`Delete order ${order.id}`}
                            className="grid size-8 place-items-center rounded-sm border border-red-200 bg-red-50 text-red-700 transition duration-700 hover:bg-red-100 hover:text-red-800"
                            onClick={() => void deleteOrder(order)}
                            title="Delete order"
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {(activePage - 1) * pageSize + 1}–{Math.min(activePage * pageSize, total)} of {total} orders
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2">
                  <span>Per page</span>
                  <select
                    aria-label="Orders per page"
                    className="h-9 rounded-sm border border-[#eadfca] bg-white px-2"
                    onChange={(event) => updatePageSize(Number(event.target.value) as (typeof pageSizes)[number])}
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
                  aria-label="Previous page"
                  className="secondary-button"
                  disabled={isFetching || activePage === 1}
                  onClick={() => setPage(activePage - 1)}
                  type="button"
                >
                  Previous
                </button>
                <span className="min-w-20 text-center font-medium text-stone-800">
                  Page {activePage} of {totalPages}
                </span>
                <button
                  aria-label="Next page"
                  className="secondary-button"
                  disabled={isFetching || activePage >= totalPages}
                  onClick={() => setPage(activePage + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
      {editing ? <OrderStatusDialog close={() => setEditing(null)} item={editing} save={updateStatus} /> : null}
      <OrderDetailModal isOpen={Boolean(viewingOrder)} onClose={() => setViewingOrder(null)} order={viewingOrder} />
      <OrderLimitModal isOpen={orderLimitOpen} onClose={() => setOrderLimitOpen(false)} />
    </main>
  );
}

function OrderStatusDialog({
  close,
  item,
  save,
}: {
  close: () => void;
  item: OrderItem;
  save: ReturnType<typeof useUpdateOrderStatusMutation>[0];
}) {
  const [status, setStatus] = useState<OrderStatus>(item.status);
  const [saving, setSaving] = useState(false);
  async function submit() {
    if (status === item.status) return close();
    setSaving(true);
    try {
      await save({ id: item.id, status }).unwrap();
      toast.success("Order status updated.");
      close();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-stone-950/30 p-3 backdrop-blur-sm sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) close();
      }}
    >
      <section
        aria-modal="true"
        className="relative w-full max-w-md rounded-sm border border-[#eadfca] bg-white p-4 shadow-2xl sm:p-5"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-stone-900">Update order status</h2>
            <p className="mt-1 break-all text-xs text-stone-500">{item.id}</p>
          </div>
          <button
            aria-label="Close status editor"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-sm text-stone-400 transition hover:bg-amber-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            disabled={saving}
            onClick={close}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <label className="mt-5 block text-sm font-medium text-stone-700">
          Status
          <select
            className="mt-1 h-10 w-full rounded-sm border border-[#eadfca] bg-white px-3"
            onChange={(event) => setStatus(event.target.value as OrderStatus)}
            value={status}
          >
            {orderStatuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-2 border-t border-[#eadfca] pt-4">
          <button className="secondary-button" onClick={close} type="button">
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={saving || status === item.status}
            onClick={() => void submit()}
            type="button"
          >
            Save status
          </button>
        </div>
      </section>
    </div>
  );
}
