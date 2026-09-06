/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 7 September, 2026
|-----------------------------------------
*/

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Edit3, Loader2, Plus, Search, Sparkles, Trash2, Users, Workflow, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/global-toast";
import { customerStatuses, type Customer, type CustomerFunnel, type CustomerStatus } from "@/lib/dashboard/customers";
import {
  useArchiveCustomerMutation,
  useCreateCustomerMutation,
  useCreateFunnelMutation,
  useDeleteFunnelMutation,
  useGetCustomersQuery,
  useGetFunnelsQuery,
  useUpdateCustomerMutation,
  useUpdateFunnelMutation,
} from "@/redux/features/dashboard/customer/customerSlice";

type Tab = "funnels" | "customers";
const demoStages = [
  "Follow or send message",
  "Interested in buying products",
  "Bought products",
  "Bought products again",
];
const bangladeshDemoCustomers: Omit<Customer, "id" | "createdAt" | "updatedAt" | "metrics">[] = [
  {
    funnelId: null,
    name: "Nusrat Jahan",
    email: "nusrat.jahan@example.com",
    address: "Dhanmondi, Dhaka",
    whatsappNumber: "+8801712345678",
    mobileNumber: "+8801712345678",
    source: "Facebook",
    author: "Sales team",
    notes: "Interested in kitchen appliances.",
    customerStatus: "lead",
    tags: ["Dhaka", "Facebook"],
  },
  {
    funnelId: null,
    name: "Md. Rakib Hasan",
    email: "rakib.hasan@example.com",
    address: "Panchlaish, Chattogram",
    whatsappNumber: "+8801812345678",
    mobileNumber: "+8801812345678",
    source: "Google Search",
    author: "Sales team",
    notes: "Asked about delivery options.",
    customerStatus: "active",
    tags: ["Chattogram", "Google"],
  },
  {
    funnelId: null,
    name: "Farzana Akter",
    email: "farzana.akter@example.com",
    address: "Shibganj, Bogura",
    whatsappNumber: "+8801912345678",
    mobileNumber: "+8801912345678",
    source: "Referral",
    author: "Support team",
    notes: "Returning customer referral.",
    customerStatus: "active",
    tags: ["Bogura", "Referral"],
  },
];
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
    [status, setStatus] = useState<CustomerStatus>();
  const [funnelForm, setFunnelForm] = useState<CustomerFunnel | null | undefined>(),
    [customerForm, setCustomerForm] = useState<Customer | null | undefined>();
  const [demoConfirmOpen, setDemoConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerFunnel | null>(null);
  const [importingCustomers, setImportingCustomers] = useState(false);
  const { data: funnels, isLoading: funnelsLoading } = useGetFunnelsQuery();
  const { data: customers, isLoading: customersLoading } = useGetCustomersQuery({ search, status });
  const [createFunnel, createFunnelState] = useCreateFunnelMutation(),
    [updateFunnel, updateFunnelState] = useUpdateFunnelMutation();
  const [createCustomer, createCustomerState] = useCreateCustomerMutation(),
    [updateCustomer, updateCustomerState] = useUpdateCustomerMutation();
  const [archive, archiveState] = useArchiveCustomerMutation();
  const [deleteFunnel, deleteFunnelState] = useDeleteFunnelMutation();
  const busy =
    createFunnelState.isLoading ||
    updateFunnelState.isLoading ||
    createCustomerState.isLoading ||
    updateCustomerState.isLoading;
  async function saveFunnel(
    form: Pick<CustomerFunnel, "name" | "description" | "minimumAmount" | "maximumAmount" | "stages">,
  ) {
    try {
      if (funnelForm) await updateFunnel({ ...form, id: funnelForm.id }).unwrap();
      else await createFunnel(form).unwrap();
      setFunnelForm(undefined);
      toast.success(funnelForm ? "Funnel updated." : "Funnel created.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save funnel."));
    }
  }
  async function createDemoFunnel() {
    try {
      const created = await createFunnel({
        name: "Customer follow-up funnel",
        description: "A four-stage customer follow-up journey.",
        minimumAmount: 0,
        maximumAmount: null,
        stages: [],
      }).unwrap();
      let stages: CustomerFunnel["stages"] = [];
      for (const name of demoStages) {
        stages = [...stages, { id: crypto.randomUUID(), name }];
        await updateFunnel({ ...created.item, stages }).unwrap();
      }
      setDemoConfirmOpen(false);
      toast.success("Demo funnel with four stages created.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not create demo funnel."));
    }
  }
  async function importBangladeshCustomers() {
    setImportingCustomers(true);
    try {
      for (const customer of bangladeshDemoCustomers) await createCustomer(customer).unwrap();
      toast.success("Bangladesh demo customers imported.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not import demo customers."));
    } finally {
      setImportingCustomers(false);
    }
  }
  async function removeFunnel() {
    if (!deleteTarget) return;
    try {
      await deleteFunnel(deleteTarget.id).unwrap();
      toast.success("Funnel deleted. Customers assigned to it were unassigned.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete funnel."));
    }
  }
  async function saveCustomer(form: Omit<Customer, "id" | "createdAt" | "updatedAt" | "metrics">) {
    try {
      if (customerForm) await updateCustomer({ ...form, id: customerForm.id }).unwrap();
      else await createCustomer(form).unwrap();
      setCustomerForm(undefined);
      toast.success(customerForm ? "Customer updated." : "Customer created.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save customer."));
    }
  }
  return (
    <main className="min-h-[calc(100vh-65px)] flex-1 bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl rounded-sm border border-[#eadfca] bg-white p-4 shadow-[0_16px_40px_-30px_rgba(120,53,15,.35)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">Customer management</h1>
            <p className="mt-1 text-sm text-stone-600">
              Build a thoughtful journey from first message to repeat purchase.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => (tab === "funnels" ? setFunnelForm(null) : setCustomerForm(null))}
            type="button"
          >
            <Plus className="h-4 w-4" /> Add {tab === "funnels" ? "funnel" : "customer"}
          </button>
        </div>
        <div className="mt-6 inline-flex rounded-sm border border-[#eadfca] bg-[#fffaf0] p-1" role="tablist">
          {(
            [
              ["funnels", "Funnels", Workflow],
              ["customers", "Customers", Users],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              aria-selected={tab === value}
              className="relative isolate flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium outline-none transition-colors"
              key={value}
              onClick={() => setTab(value)}
              role="tab"
              type="button"
            >
              {tab === value && (
                <motion.span
                  className="absolute inset-0 -z-10 rounded-sm bg-amber-700 shadow-sm"
                  layoutId="customer-active-tab"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <Icon className={`h-4 w-4 ${tab === value ? "text-white" : "text-amber-800"}`} />
              <span className={tab === value ? "text-white" : "text-stone-600"}>{label}</span>
              <span
                className={`rounded-sm px-1.5 py-0.5 text-[11px] ${tab === value ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"}`}
              >
                {value === "funnels" ? (funnels?.items.length ?? 0) : (customers?.items.length ?? 0)}
              </span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {tab === "funnels" ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              key="funnels"
              transition={{ duration: 0.22 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-amber-200 bg-gradient-to-r from-amber-50 to-[#fffdfa] p-4">
                <div>
                  <h2 className="font-semibold text-stone-900">Guide each customer with purpose</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Start with the ready-made four-stage demo or design your own funnel.
                  </p>
                </div>
                <button
                  className="secondary-button border-amber-300 bg-white text-amber-900"
                  onClick={() => setDemoConfirmOpen(true)}
                  type="button"
                >
                  <Sparkles className="h-4 w-4" /> Add demo funnel
                </button>
              </div>
              {funnelsLoading ? (
                <LoadingCards />
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(funnels?.items ?? []).map((funnel) => (
                    <FunnelCard
                      funnel={funnel}
                      key={funnel.id}
                      onDelete={() => setDeleteTarget(funnel)}
                      onEdit={() => setFunnelForm(funnel)}
                    />
                  ))}
                  {!funnels?.items.length && (
                    <Empty
                      detail="Create a funnel manually or add the demo journey to get started."
                      title="No funnels yet"
                    />
                  )}
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              key="customers"
              transition={{ duration: 0.22 }}
            >
              <div className="grid gap-3 rounded-sm border border-[#eadfca] bg-[#fffdfa] p-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    className="input pl-9"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email, or phone"
                    value={search}
                  />
                </label>
                <select
                  className="input"
                  onChange={(e) => setStatus((e.target.value || undefined) as CustomerStatus)}
                  value={status ?? ""}
                >
                  <option value="">All statuses</option>
                  {customerStatuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              {customersLoading ? (
                <LoadingCards />
              ) : (
                <div className="mt-4 grid gap-3">
                  {(customers?.items ?? []).map((customer) => (
                    <CustomerCard
                      archiving={archiveState.isLoading}
                      customer={customer}
                      key={customer.id}
                      onArchive={() => void archive(customer.id)}
                      onEdit={() => setCustomerForm(customer)}
                    />
                  ))}
                  {!customers?.items.length && (
                    <Empty detail="Add a customer to begin tracking their journey." title="No customers found">
                      <button
                        className="primary-button mt-5"
                        disabled={importingCustomers}
                        onClick={() => void importBangladeshCustomers()}
                        type="button"
                      >
                        {importingCustomers && <Loader2 className="h-4 w-4 animate-spin" />}
                        {importingCustomers ? "Importing…" : "Import Bangladesh demo customers"}
                      </button>
                    </Empty>
                  )}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </section>
      {funnelForm !== undefined && (
        <FunnelModal busy={busy} close={() => setFunnelForm(undefined)} initial={funnelForm} save={saveFunnel} />
      )}
      {customerForm !== undefined && (
        <CustomerModal
          busy={busy}
          close={() => setCustomerForm(undefined)}
          funnels={funnels?.items ?? []}
          initial={customerForm}
          save={saveCustomer}
        />
      )}
      {demoConfirmOpen && (
        <ConfirmDemo
          busy={createFunnelState.isLoading}
          cancel={() => setDemoConfirmOpen(false)}
          confirm={() => void createDemoFunnel()}
        />
      )}
      <AlertDialog
        busy={deleteFunnelState.isLoading}
        confirmLabel="Delete funnel"
        description={
          deleteTarget
            ? `Delete “${deleteTarget.name}”? Customers assigned to it will remain, but no longer have a selected funnel.`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void removeFunnel()}
        open={Boolean(deleteTarget)}
        title="Delete this funnel?"
      />
    </main>
  );
}
function FunnelCard({
  funnel,
  onEdit,
  onDelete,
}: {
  funnel: CustomerFunnel;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const stages = funnel.stages ?? [];
  return (
    <article className="group rounded-sm border border-[#eadfca] bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-stone-900">{funnel.name}</h2>
          <p className="mt-1 text-sm text-stone-600">{funnel.description || "No description added."}</p>
        </div>
        <div className="flex gap-1">
          <button aria-label={`Edit ${funnel.name}`} className="icon-button" onClick={onEdit} type="button">
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            aria-label={`Delete ${funnel.name}`}
            className="icon-button border-red-100 text-red-700 hover:bg-red-50"
            onClick={onDelete}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-amber-900">
        ৳{funnel.minimumAmount} – {funnel.maximumAmount == null ? "No maximum" : `৳${funnel.maximumAmount}`}
      </p>
      {stages.length > 0 && (
        <ol className="mt-4 space-y-2 border-t border-stone-100 pt-3">
          {stages.map((stage, index) => (
            <li className="flex items-center gap-2 text-sm text-stone-600" key={stage.id}>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-100 text-[10px] font-semibold text-amber-800">
                {index + 1}
              </span>
              {stage.name}
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
function CustomerCard({
  customer,
  onEdit,
  onArchive,
  archiving,
}: {
  customer: Customer;
  onEdit: () => void;
  onArchive: () => void;
  archiving: boolean;
}) {
  return (
    <article className="rounded-sm border border-[#eadfca] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-stone-900">{customer.name}</h2>
            <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {customer.customerStatus}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600">
            {customer.email} {customer.mobileNumber ? `· ${customer.mobileNumber}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="secondary-button h-9 px-3" onClick={onEdit} type="button">
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            className="secondary-button h-9 border-red-200 px-3 text-red-700 hover:bg-red-50"
            disabled={archiving}
            onClick={onArchive}
            type="button"
          >
            Archive
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
        <span>Spent ৳{customer.metrics.amountSpent}</span>
        <span>Purchases {customer.metrics.purchaseCount}</span>
        <span>With us {customer.metrics.haveWithUs}</span>
        {customer.tags.map((tag) => (
          <span className="rounded-sm bg-stone-100 px-2 py-0.5 text-xs" key={tag}>
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
function LoadingCards() {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="h-36 animate-pulse rounded-sm bg-amber-50" />
      <div className="h-36 animate-pulse rounded-sm bg-amber-50" />
    </div>
  );
}
function Empty({ title, detail, children }: { title: string; detail: string; children?: React.ReactNode }) {
  return (
    <div className="col-span-full rounded-sm border border-dashed border-[#d9c9aa] bg-[#fffdfa] p-10 text-center">
      <h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-600">{detail}</p>
      {children}
    </div>
  );
}
function Modal({
  children,
  close,
  title,
  detail,
}: {
  children: React.ReactNode;
  close: () => void;
  title: string;
  detail: string;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[90] grid place-items-center bg-stone-950/35 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm border border-[#eadfca] bg-[#fffaf0] p-5 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#eadfca] pb-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
            <p className="mt-1 text-sm text-stone-600">{detail}</p>
          </div>
          <button aria-label="Close" className="icon-button shrink-0" onClick={close} type="button">
            <X className="h-4 w-4" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
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
    form: Pick<CustomerFunnel, "name" | "description" | "minimumAmount" | "maximumAmount" | "stages">,
  ) => Promise<void>;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    minimumAmount: initial?.minimumAmount ?? 0,
    maximumAmount: initial?.maximumAmount?.toString() ?? "",
  });
  const [stages, setStages] = useState<CustomerFunnel["stages"]>(initial?.stages ?? []);
  return (
    <Modal
      close={close}
      detail="Set the name, purpose, and value range for this customer journey."
      title={initial ? "Edit funnel" : "Create funnel"}
    >
      <form
        className="mt-5"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save({ ...form, stages, maximumAmount: form.maximumAmount === "" ? null : Number(form.maximumAmount) });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              autoFocus
              className="input"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              value={form.name}
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
          <Field label="Description">
            <textarea
              className="input min-h-28 resize-y"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              value={form.description}
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
        </div>
        <div className="mt-5 rounded-sm border border-[#eadfca] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-stone-900">Funnel steps</h3>
              <p className="text-xs text-stone-500">Add or edit every step in this journey.</p>
            </div>
            <button
              className="secondary-button h-9 px-3"
              onClick={() => setStages([...stages, { id: crypto.randomUUID(), name: "" }])}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" /> Add step
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {stages.map((stage, index) => (
              <div className="flex items-center gap-2" key={stage.id}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-amber-100 text-xs font-semibold text-amber-800">
                  {index + 1}
                </span>
                <input
                  aria-label={`Funnel step ${index + 1}`}
                  className="input h-9"
                  onChange={(e) =>
                    setStages(stages.map((item) => (item.id === stage.id ? { ...item, name: e.target.value } : item)))
                  }
                  placeholder="Describe this step"
                  value={stage.name}
                />
                <button
                  aria-label={`Remove step ${index + 1}`}
                  className="icon-button h-9 w-9 border-red-100 text-red-700 hover:bg-red-50"
                  onClick={() => setStages(stages.filter((item) => item.id !== stage.id))}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {!stages.length && (
              <p className="rounded-sm bg-amber-50 p-3 text-sm text-stone-600">
                No steps yet. Add the first action in this funnel.
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" disabled={busy} onClick={close} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Saving…" : "Save funnel"}
          </button>
        </div>
      </form>
    </Modal>
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
  save: (form: Omit<Customer, "id" | "createdAt" | "updatedAt" | "metrics">) => Promise<void>;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    funnelId: initial?.funnelId ?? "",
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    whatsappNumber: initial?.whatsappNumber ?? "",
    mobileNumber: initial?.mobileNumber ?? "",
    source: initial?.source ?? "",
    author: initial?.author ?? "",
    notes: initial?.notes ?? "",
    customerStatus: initial?.customerStatus ?? ("lead" as CustomerStatus),
    tags: initial?.tags.join(", ") ?? "",
  });
  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  return (
    <Modal
      close={close}
      detail="Keep contact details, origin, ownership, and notes together."
      title={initial ? "Edit customer" : "Create customer"}
    >
      <form
        className="mt-5"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save({
            ...form,
            funnelId: form.funnelId || null,
            tags: form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              autoFocus
              className="input"
              onChange={(e) => set("name", e.target.value)}
              required
              value={form.name}
            />
          </Field>
          <Field label="Email">
            <input
              className="input"
              onChange={(e) => set("email", e.target.value)}
              required
              type="email"
              value={form.email}
            />
          </Field>
          <Field label="Selected funnel">
            <select className="input" onChange={(e) => set("funnelId", e.target.value)} value={form.funnelId}>
              <option value="">No funnel selected</option>
              {funnels.map((funnel) => (
                <option key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Customer status">
            <select
              className="input"
              onChange={(e) => set("customerStatus", e.target.value)}
              value={form.customerStatus}
            >
              {customerStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mobile number">
            <input className="input" onChange={(e) => set("mobileNumber", e.target.value)} value={form.mobileNumber} />
          </Field>
          <Field label="WhatsApp number">
            <input
              className="input"
              onChange={(e) => set("whatsappNumber", e.target.value)}
              value={form.whatsappNumber}
            />
          </Field>
          <Field label="Source / found from">
            <input className="input" onChange={(e) => set("source", e.target.value)} value={form.source} />
          </Field>
          <Field label="Author">
            <input className="input" onChange={(e) => set("author", e.target.value)} value={form.author} />
          </Field>
          <Field label="Tags (comma separated)">
            <input className="input" onChange={(e) => set("tags", e.target.value)} value={form.tags} />
          </Field>
          <Field label="Address">
            <input className="input" onChange={(e) => set("address", e.target.value)} value={form.address} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                className="input min-h-28 resize-y"
                onChange={(e) => set("notes", e.target.value)}
                value={form.notes}
              />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" disabled={busy} onClick={close} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Saving…" : "Save customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function ConfirmDemo({ cancel, confirm, busy }: { cancel: () => void; confirm: () => void; busy: boolean }) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-stone-950/35 p-4 backdrop-blur-sm"
      role="alertdialog"
    >
      <section className="w-full max-w-md rounded-sm border border-[#eadfca] bg-[#fffaf0] p-5 shadow-2xl">
        <CheckCircle2 className="h-8 w-8 text-amber-700" />
        <h2 className="mt-3 text-lg font-semibold text-stone-900">Add the demo funnel?</h2>
        <p className="mt-1 text-sm text-stone-600">This creates a ready-to-use four-stage journey:</p>
        <ol className="mt-3 space-y-2">
          {demoStages.map((stage, index) => (
            <li className="flex gap-2 text-sm text-stone-700" key={stage}>
              <span className="font-semibold text-amber-800">{index + 1}.</span>
              {stage}
            </li>
          ))}
        </ol>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" disabled={busy} onClick={cancel} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={busy} onClick={confirm} type="button">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Creating…" : "Create demo funnel"}
          </button>
        </div>
      </section>
    </div>
  );
}
