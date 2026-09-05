/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

"use client";

import { Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { useConfirmDelete } from "@/components/confirm-delete-provider";
import { toast } from "@/components/ui/global-toast";
import { categoryDefaults, normalizeSlug } from "@/lib/dashboard/catalog";
import {
  type CategoryInput,
  type CategoryItem,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/features/dashboard/categories/categoriesSlice";

const errorMessage = (error: unknown, fallback: string) =>
  typeof error === "object" &&
  error &&
  "data" in error &&
  typeof (error as { data?: { error?: string } }).data?.error === "string"
    ? (error as { data: { error: string } }).data.error
    : fallback;

export default function CategoryPage() {
  const { data, error, isFetching, isLoading, refetch } = useGetCategoriesQuery();
  const [create, createState] = useCreateCategoryMutation();
  const [update, updateState] = useUpdateCategoryMutation();
  const [remove, removeState] = useDeleteCategoryMutation();
  const confirmDelete = useConfirmDelete();
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [open, setOpen] = useState(false);
  const busy = createState.isLoading || updateState.isLoading || removeState.isLoading;
  const items = data?.items ?? [];

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  async function save(form: CategoryInput) {
    try {
      if (editing) await update({ ...form, id: editing.id }).unwrap();
      else await create(form).unwrap();
      setOpen(false);
      toast.success(editing ? "Category updated successfully." : "Category created successfully.");
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not save category."));
    }
  }

  async function destroy(item: CategoryItem) {
    if (!(await confirmDelete(`Delete “${item.name}”? Categories assigned to products cannot be deleted.`))) return;
    try {
      await remove(item.id).unwrap();
      toast.success("Category deleted successfully.");
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not delete category."));
    }
  }

  return (
    <main className="min-h-[calc(100vh-65px)] flex-1 bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl rounded-sm border border-[#eadfca] bg-white p-4 shadow-[0_16px_40px_-30px_rgba(120,53,15,.35)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Categories</h1>
            <p className="mt-1 text-sm text-stone-600">
              Create product categories and keep their descriptions organized.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="secondary-button" disabled={isFetching} onClick={() => void refetch()} type="button">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button className="primary-button" onClick={openCreate} type="button">
              <Plus className="h-4 w-4" /> Add category
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700">
            {errorMessage(error, "Could not load categories.")}
          </p>
        )}
        {isLoading ? (
          <div className="mt-5 grid gap-3" role="status">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-20 animate-pulse rounded-sm bg-amber-50" key={index} />
            ))}
          </div>
        ) : !items.length ? (
          <div className="mt-5 rounded-sm border border-dashed border-[#d9c9aa] p-10 text-center text-sm text-stone-500">
            No categories yet. Add your first category to start assigning products.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-sm border border-stone-200">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#f8f0df] text-xs uppercase text-stone-500">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr className="border-t border-stone-100" key={item.id}>
                      <td className="p-3 font-medium text-stone-900">{item.name}</td>
                      <td className="p-3 text-stone-600">{item.slug}</td>
                      <td className="max-w-xs truncate p-3 text-stone-600" title={item.description}>
                        {item.description || "—"}
                      </td>
                      <td className="p-3">
                        <Status status={item.status} />
                      </td>
                      <td className="p-3">
                        <Actions
                          edit={() => {
                            setEditing(item);
                            setOpen(true);
                          }}
                          remove={() => void destroy(item)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-3 md:hidden">
              {items.map((item) => (
                <article className="rounded-sm border border-stone-200 p-3" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="mt-1 truncate text-xs text-stone-500">{item.slug}</p>
                    </div>
                    <Actions
                      edit={() => {
                        setEditing(item);
                        setOpen(true);
                      }}
                      remove={() => void destroy(item)}
                    />
                  </div>
                  <p className="mt-3 text-sm text-stone-600">{item.description || "No description."}</p>
                  <div className="mt-3">
                    <Status status={item.status} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
      {open && <CategoryForm busy={busy} close={() => setOpen(false)} initial={editing} save={save} />}
    </main>
  );
}

function CategoryForm({
  busy,
  close,
  initial,
  save,
}: {
  busy: boolean;
  close: () => void;
  initial: CategoryItem | null;
  save: (form: CategoryInput) => Promise<void>;
}) {
  const [form, setForm] = useState<CategoryInput>(
    initial
      ? { name: initial.name, slug: initial.slug, description: initial.description, status: initial.status }
      : categoryDefaults,
  );
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-stone-950/30 p-4 backdrop-blur-sm">
      <form
        aria-modal="true"
        className="w-full max-w-lg rounded-sm border border-[#eadfca] bg-[#fffaf0] p-5 shadow-2xl"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void save(form);
        }}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{initial ? "Edit category" : "Add category"}</h2>
            <p className="mt-1 text-sm text-stone-500">Use a unique slug for the category URL.</p>
          </div>
          <button aria-label="Close" className="icon-button" onClick={close} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <Field label="Name">
            <input
              autoFocus
              className="input"
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                  slug: initial ? form.slug : normalizeSlug(event.target.value),
                })
              }
              required
              value={form.name}
            />
          </Field>
          <Field label="Slug">
            <input
              className="input"
              onChange={(event) => setForm({ ...form, slug: normalizeSlug(event.target.value) })}
              required
              value={form.slug}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input min-h-36 resize-y"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={6}
              value={form.description}
            />
          </Field>
          <Field label="Status">
            <select
              className="input"
              onChange={(event) => setForm({ ...form, status: event.target.value as CategoryInput["status"] })}
              value={form.status}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" onClick={close} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            {busy ? "Saving…" : "Save category"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Actions({ edit, remove }: { edit: () => void; remove: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <button aria-label="Edit category" className="icon-button" onClick={edit} type="button">
        <Pencil className="h-4 w-4" />
      </button>
      <button
        aria-label="Delete category"
        className="icon-button border-red-100 text-red-700 hover:bg-red-50"
        onClick={remove}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
      </button>
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
function Status({ status }: { status: "active" | "inactive" }) {
  return (
    <span
      className={`inline-flex rounded-sm px-2 py-1 text-xs font-medium ${status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}
    >
      {status}
    </span>
  );
}
