/*
|-----------------------------------------
| setting up Leads lists, filters, and bulk actions
| @author: Codex
|-----------------------------------------
*/

"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { Icon } from "@/components/all-icons/all-icons";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/global-toast";
import { Input } from "@/components/ui/input";
import {
  normalizeLeadMobile,
  leadCan,
  leadIsManager,
  type LeadCustomer,
  type LeadItem,
  type LeadKind,
  type LeadListParams,
} from "@/lib/dashboard/leads";
import { useDashboardPermissions } from "@/lib/dashboard/use-dashboard-permissions";
import {
  useGetLeadsQuery,
  useLazyGetLeadsQuery,
  useMutateLeadsMutation,
  type LeadMutation,
} from "@/redux/features/dashboard/leads/leadsSlice";

import { exportLeadExcel, readLeadExcel } from "./excel";
import Mutation from "./Mutation";
import {
  Action,
  errorMessage,
  LeadsModal,
  LeadSelect,
  LeadsSkeleton,
  Pagination,
  RecordSelect,
  useRefreshCooldown,
} from "./ui";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
export default function Query({ kind, mine = false }: { kind: LeadKind; mine?: boolean }) {
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10);
  const [text, setText] = useState(""),
    [search, setSearch] = useState("");
  const [status, setStatus] = useState(""),
    [funnelId, setFunnelId] = useState("");
  const [assignment, setAssignment] = useState(""),
    [councilor, setCouncilor] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editor, setEditor] = useState<{ item?: LeadItem } | null>(null);
  const [view, setView] = useState<LeadItem | null>(null);
  const [assigning, setAssigning] = useState<LeadCustomer | null>(null);
  const [assignee, setAssignee] = useState("");
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const [workingFile, setWorkingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState("");
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: { row: number; error: string }[];
  } | null>(null);
  const [errorPage, setErrorPage] = useState(1),
    [errorPageSize, setErrorPageSize] = useState(10);
  const fileInput = useRef<HTMLInputElement>(null);
  const params: LeadListParams = { kind, mine, page, pageSize, search, status, funnelId, assignment, councilor };
  const area = mine && kind === "customers" ? "my-leads" : kind;
  const { data: permissionData } = useDashboardPermissions(`/dashboard/leads/${area}`);
  const actor = permissionData?.leadsActor ?? undefined;
  const canRead = leadCan(actor, area, "read");
  const canUpdate = leadCan(actor, area, "update");
  const canRemove = leadCan(actor, area, "delete");
  const { currentData, isLoading, isFetching, error, refetch } = useGetLeadsQuery(params, { skip: !canRead });
  // Never show another page/filter's rows while the new scoped query is pending.
  const result = currentData;
  const [load] = useLazyGetLeadsQuery();
  const [mutate, { isLoading: mutating }] = useMutateLeadsMutation();
  const cooldown = useRefreshCooldown();
  const isAdmin = Boolean(actor && leadIsManager(actor));
  const canManage = (item: LeadItem) => isAdmin || (item.kind === "customers" && item.assignedTo === actor?.email);
  const canCreate = leadCan(actor, area, "create") && (isAdmin || kind === "customers");
  const busy = mutating || workingFile;
  const term = text.trim().toLowerCase();
  const mobileTerm = normalizeLeadMobile(text);
  const items = (result?.items ?? []).filter(
    (item) =>
      !term ||
      [
        item.name,
        ...(item.kind === "funnels" ? [item.description, String(item.position)] : [item.mobile, item.email]),
      ].some((value) => value.toLowerCase().includes(term)) ||
      (item.kind !== "funnels" && mobileTerm && item.mobile === mobileTerm),
  );
  const manageable = items.filter((item) => canManage(item) && (canUpdate || canRemove));
  const activeSelection = selected.filter((id) => manageable.some((item) => item.id === id));
  const title = mine ? "My Leads" : kind === "funnels" ? "Funnels" : kind === "councilors" ? "Councilors" : "Customers";
  function resetPage() {
    setPage(1);
    setSelected([]);
  }
  async function run(change: Omit<LeadMutation, "kind" | "mine">, message: string) {
    try {
      const response = await mutate({ kind, mine, ...change }).unwrap();
      toast.success(message);
      setSelected([]);
      return response;
    } catch (failure) {
      toast.error(errorMessage(failure));
      return null;
    }
  }
  async function refresh() {
    if (cooldown.remaining || isFetching || busy) return;
    cooldown.start();
    try {
      await refetch().unwrap();
      toast.success("Leads refreshed.");
    } catch (failure) {
      toast.error(errorMessage(failure));
    }
  }
  async function exportExcel() {
    setWorkingFile(true);
    try {
      const first = await load({ ...params, page: 1, pageSize: 100, search: text.trim() }, false).unwrap();
      const all = [...first.items];
      const pages = Math.ceil(first.total / 100);
      for (let next = 2; next <= pages; next++) {
        setFileProgress(`Exporting page ${next} of ${pages}…`);
        const response = await load({ ...params, page: next, pageSize: 100, search: text.trim() }, false).unwrap();
        all.push(...response.items);
      }
      await exportLeadExcel(kind, all);
      toast.success(`Exported ${all.length} records matching the current filters.`);
    } catch (failure) {
      toast.error(errorMessage(failure));
    } finally {
      setWorkingFile(false);
      setFileProgress("");
    }
  }
  async function importExcel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setWorkingFile(true);
    setFileProgress("Reading Excel…");
    try {
      const rows = await readLeadExcel(file, kind);
      setFileProgress("Importing records…");
      const response = await mutate({ operation: "import", kind, mine, rows }).unwrap();
      const outcome = { imported: response.imported ?? 0, errors: response.errors ?? [] };
      setImportResult(outcome);
      setErrorPage(1);
      resetPage();
      if (outcome.errors.length)
        toast.error(`Imported ${outcome.imported}; ${outcome.errors.length} rows need correction.`);
      else toast.success(`Imported ${outcome.imported} records.`);
    } catch (failure) {
      toast.error(errorMessage(failure));
    } finally {
      setWorkingFile(false);
      setFileProgress("");
    }
  }
  return (
    <section className="custom-parent-border mx-auto min-w-0 w-full max-w-7xl rounded-sm bg-[#fffdf7] text-stone-800">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eadfca] p-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-stone-500">
            {mine
              ? "Customers assigned to your signed-in account."
              : kind === "funnels"
                ? "Arrange your customer journey with unique positions."
                : kind === "councilors"
                  ? "Manage the councilors who support your customers."
                  : "Manage customers, assignments, and counselling."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Action onClick={refresh} disabled={!canRead || Boolean(cooldown.remaining) || isFetching || busy}>
            <Icon name="RefreshCw" className={isFetching ? "animate-spin" : ""} />
            {cooldown.remaining ? `Refresh (${cooldown.remaining}s)` : "Refresh"}
          </Action>
          {canCreate && (
            <Action onClick={() => setEditor({})} disabled={busy}>
              <Icon name="Plus" />
              Add {kind === "funnels" ? "funnel" : kind === "councilors" ? "councilor" : "customer"}
            </Action>
          )}
        </div>
      </header>
      <div className="grid gap-2 border-b border-[#eadfca] p-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-40 flex-1">
            <Icon name="Search" className="absolute left-2 top-2 size-4 text-stone-400" />
            <Input
              aria-label={`Search loaded ${title.toLowerCase()}`}
              className="border-[#eadfca] pl-8"
              placeholder="Search loaded records first…"
              value={text}
              maxLength={160}
              onChange={(event) => {
                setText(event.target.value);
                setSelected([]);
                if (!event.target.value.trim()) {
                  setSearch("");
                  setPage(1);
                }
              }}
            />
          </div>
          <LeadSelect
            label="Filter by status"
            value={status}
            options={statusOptions}
            onChange={(value) => {
              setStatus(value);
              resetPage();
            }}
            disabled={busy}
          />
          {kind !== "funnels" && (
            <>
              <Action disabled={!canRead || busy || isFetching || !actor} onClick={exportExcel}>
                <Icon name="Download" />
                Export Excel
              </Action>
              {canCreate && (
                <>
                  <Action disabled={busy} onClick={() => fileInput.current?.click()}>
                    <Icon name="Upload" />
                    Import Excel
                  </Action>
                  <Action
                    disabled={busy}
                    onClick={() => {
                      void exportLeadExcel(kind, [], true).catch((failure) => toast.error(errorMessage(failure)));
                    }}
                  >
                    Template
                  </Action>
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".xlsx,.xls"
                    aria-label="Import Excel file"
                    className="hidden"
                    onChange={importExcel}
                    disabled={busy}
                  />
                </>
              )}
            </>
          )}
        </div>
        {kind === "customers" && (
          <div className="grid gap-2 sm:grid-cols-3">
            <RecordSelect
              kind="funnels"
              label="All funnels"
              value={funnelId}
              onChange={(value) => {
                setFunnelId(value);
                resetPage();
              }}
              disabled={busy}
            />
            <div>
              <LeadSelect
                label="Filter by assignment"
                value={assignment}
                options={[
                  { value: "", label: "All assignments" },
                  { value: "assigned", label: "Assigned" },
                  { value: "unassigned", label: "Unassigned" },
                ]}
                onChange={(value) => {
                  setAssignment(value);
                  resetPage();
                }}
                disabled={busy}
              />
            </div>
            <RecordSelect
              kind="councilors"
              label="All councilors"
              value={councilor}
              onChange={(value) => {
                setCouncilor(value);
                resetPage();
              }}
              disabled={busy}
            />
          </div>
        )}
        {mine && (
          <p className="text-xs text-stone-500">
            Assignment filters only narrow your own leads; other councilors and unassigned customers will have no
            matches.
          </p>
        )}
        {kind !== "funnels" && canCreate && (
          <p className="text-xs text-stone-500">
            Excel: up to 100 rows per import. Keep Mobile cells as text. Customer imports require Funnel ID from a
            funnel&apos;s View dialog. Assignment columns in exports are informational; My Leads imports assign to you.
          </p>
        )}
      </div>
      {busy && (
        <p className="border-b border-[#eadfca] p-3 text-sm text-amber-800" role="status">
          {fileProgress || "Saving changes…"}
        </p>
      )}
      {activeSelection.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#eadfca] bg-amber-50 p-3 text-sm">
          <span>{activeSelection.length} selected</span>
          <Action
            disabled={!canUpdate || busy || isFetching}
            tone="save"
            onClick={() =>
              void run({ operation: "status", ids: activeSelection, status: "active" }, "Selected records activated.")
            }
          >
            Set active
          </Action>
          <Action
            disabled={!canUpdate || busy || isFetching}
            onClick={() =>
              void run(
                { operation: "status", ids: activeSelection, status: "inactive" },
                "Selected records deactivated.",
              )
            }
          >
            Set inactive
          </Action>
          <Action
            tone="delete"
            disabled={!canRemove || busy || isFetching}
            onClick={() => setDeleting(activeSelection)}
          >
            <Icon name="Trash2" />
            Delete selected
          </Action>
          <Action disabled={busy} onClick={() => setSelected([])}>
            Clear
          </Action>
        </div>
      )}
      {!canRead ? (
        <p className="p-3 text-sm text-stone-500">Read permission is required to display existing records.</p>
      ) : error ? (
        <div className="p-3 text-sm text-red-700" role="alert">
          {errorMessage(error)}
        </div>
      ) : isLoading || (isFetching && !result) ? (
        <LeadsSkeleton />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#eadfca] bg-amber-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="w-10 p-3">
                    <Checkbox
                      aria-label="Select manageable records on this page"
                      disabled={busy || !manageable.length}
                      checked={manageable.length > 0 && activeSelection.length === manageable.length}
                      onCheckedChange={(checked) => setSelected(checked ? manageable.map((item) => item.id) : [])}
                    />
                  </th>
                  <th className="p-3">Name</th>
                  {kind === "funnels" ? (
                    <>
                      <th className="p-3">Position</th>
                      <th className="p-3">Description</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Email</th>
                    </>
                  )}
                  {kind === "customers" && (
                    <>
                      <th className="p-3">Funnel</th>
                      <th className="p-3">Councilor</th>
                      <th className="p-3">Block</th>
                    </>
                  )}
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#eadfca] bg-white last:border-0">
                    <td className="p-3">
                      <Checkbox
                        aria-label={`Select ${item.name}`}
                        checked={activeSelection.includes(item.id)}
                        disabled={busy || !canManage(item) || (!canUpdate && !canRemove)}
                        onCheckedChange={(checked) =>
                          setSelected((previous) =>
                            checked ? [...new Set([...previous, item.id])] : previous.filter((id) => id !== item.id),
                          )
                        }
                      />
                    </td>
                    <td className="max-w-40 truncate p-3 font-medium">{item.name}</td>
                    {item.kind === "funnels" ? (
                      <>
                        <td className="p-3">{item.position}</td>
                        <td className="max-w-52 truncate p-3">{item.description || "—"}</td>
                      </>
                    ) : (
                      <>
                        <td className="whitespace-nowrap p-3">{item.mobile}</td>
                        <td className="max-w-44 truncate p-3">{item.email || "—"}</td>
                      </>
                    )}
                    {item.kind === "customers" && (
                      <>
                        <td className="max-w-40 truncate p-3">{item.funnelName ?? item.funnelId}</td>
                        <td className="max-w-44 truncate p-3">
                          {item.assignedName || item.assignedTo || "Unassigned"}
                        </td>
                        <td className="p-3">{item.blocked ? "Blocked" : "No"}</td>
                      </>
                    )}
                    <td className="p-3">
                      <span
                        className={`rounded-sm px-2 py-1 text-xs ${item.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <Action aria-label={`View ${item.name}`} disabled={busy} onClick={() => setView(item)}>
                          <Icon name="Eye" />
                          View
                        </Action>
                        {canManage(item) && (
                          <>
                            <Action
                              aria-label={`Edit ${item.name}`}
                              disabled={!canUpdate || busy}
                              onClick={() => setEditor({ item })}
                            >
                              <Icon name="Edit2" />
                              Edit
                            </Action>
                            <Action
                              tone="delete"
                              aria-label={`Delete ${item.name}`}
                              disabled={!canRemove || busy}
                              onClick={() => setDeleting([item.id])}
                            >
                              <Icon name="Trash2" />
                            </Action>
                          </>
                        )}
                        {item.kind === "customers" && isAdmin && canUpdate && !mine && (
                          <Action
                            disabled={busy}
                            onClick={() => {
                              setAssigning(item);
                              setAssignee(item.assignedTo ?? "");
                            }}
                          >
                            Assign
                          </Action>
                        )}
                        {item.kind === "customers" &&
                          actor?.role === "councilor" &&
                          canUpdate &&
                          !mine &&
                          !item.assignedTo &&
                          !item.blocked &&
                          item.status === "active" && (
                            <Action
                              tone="save"
                              disabled={busy}
                              onClick={() => void run({ operation: "claim", id: item.id }, "Customer assigned to you.")}
                            >
                              Take assignment
                            </Action>
                          )}
                        {item.kind === "customers" &&
                          item.assignedTo === actor?.email &&
                          canUpdate &&
                          !item.blocked &&
                          item.status === "active" && (
                            <Action
                              tone="save"
                              disabled={busy}
                              onClick={() => void run({ operation: "counsel", id: item.id }, "Counselling recorded.")}
                            >
                              Mark counselled
                            </Action>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!items.length && (
            <div className="grid justify-items-center gap-2 p-6 text-sm text-stone-500">
              <Icon name="Search" className="size-6" />
              <p>{term ? "No matches in the loaded records." : "No records match these filters."}</p>
              {term && search !== text.trim() && (
                <Action
                  disabled={isFetching || busy}
                  onClick={() => {
                    setSearch(text.trim());
                    resetPage();
                  }}
                >
                  <Icon name="Database" />
                  Search database
                </Action>
              )}
              {term && search === text.trim() && <p>Database search completed.</p>}
            </div>
          )}
          <Pagination
            page={result?.page ?? page}
            total={result?.total ?? 0}
            pageSize={pageSize}
            onPage={(next) => {
              setPage(next);
              setSelected([]);
            }}
            onSize={(size) => {
              setPageSize(size);
              resetPage();
            }}
            disabled={busy || isFetching}
          />
        </>
      )}
      {isFetching && (
        <p role="status" className="p-3 text-sm text-amber-800">
          Loading records…
        </p>
      )}
      {editor && (
        <Mutation
          key={editor.item?.id ?? "new"}
          kind={kind}
          mine={mine}
          item={editor.item}
          onClose={() => setEditor(null)}
        />
      )}
      {view && (
        <LeadsModal title="Record details" onClose={() => setView(null)}>
          <dl className="grid gap-2 p-3 text-sm">
            {Object.entries(view)
              .filter(([key]) => key !== "kind")
              .map(([key, value]) => (
                <div key={key} className="grid gap-1 border-b border-[#eadfca] py-2 sm:grid-cols-[140px_1fr]">
                  <dt className="font-medium text-stone-500">{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd className="min-w-0 break-words whitespace-pre-wrap">
                    {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—"}
                  </dd>
                </div>
              ))}
          </dl>
        </LeadsModal>
      )}
      {assigning && (
        <LeadsModal title="Assign councilor" busy={mutating} onClose={() => setAssigning(null)}>
          <div className="grid gap-3 p-3">
            <p className="break-words text-sm">{assigning.name}</p>
            <RecordSelect
              kind="councilors"
              value={assignee}
              label="Unassigned"
              selectedLabel={assigning.assignedName || assigning.assignedTo || undefined}
              onChange={setAssignee}
              activeOnly
              disabled={mutating}
            />
            <div className="flex justify-end gap-2">
              <Action disabled={mutating} onClick={() => setAssigning(null)}>
                Cancel
              </Action>
              <Action
                tone="save"
                disabled={mutating}
                onClick={async () => {
                  const response = await run(
                    { operation: "assign", id: assigning.id, assignedTo: assignee || null },
                    "Assignment updated.",
                  );
                  if (response) setAssigning(null);
                }}
              >
                {mutating ? "Saving…" : "Save assignment"}
              </Action>
            </div>
          </div>
        </LeadsModal>
      )}
      <AlertDialog
        open={Boolean(deleting)}
        busy={mutating}
        title={`Delete ${deleting?.length ?? 0} record(s)?`}
        description="This permanently deletes the selected records. Funnels and councilors with assigned customers must be cleared or reassigned first."
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const response = await run({ operation: "delete", ids: deleting }, "Selected records deleted.");
          if (response) setDeleting(null);
        }}
      />
      {importResult && (
        <LeadsModal title="Import results" onClose={() => setImportResult(null)}>
          <div className="grid gap-3 p-3 text-sm">
            <p>
              {importResult.imported} imported · {importResult.errors.length} failed. Correct failed rows and import
              only those rows again.
            </p>
            {importResult.errors.slice((errorPage - 1) * errorPageSize, errorPage * errorPageSize).map((failure) => (
              <p key={failure.row} className="break-words rounded-sm border border-[#eadfca] bg-red-50 p-2">
                Row {failure.row}: {failure.error}
              </p>
            ))}
            {importResult.errors.length > 10 && (
              <Pagination
                page={errorPage}
                total={importResult.errors.length}
                pageSize={errorPageSize}
                onPage={setErrorPage}
                onSize={(size) => {
                  setErrorPageSize(size);
                  setErrorPage(1);
                }}
              />
            )}
          </div>
        </LeadsModal>
      )}
    </section>
  );
}
