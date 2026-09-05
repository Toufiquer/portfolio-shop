/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { MongoServerError } from "mongodb";

import {
  authorizeCategoryRequest,
  ensureCategoryIndexes,
  serializeCategory,
} from "@/app/api/dashboard/categories/v1/route";
import { client } from "@/app/api/lib/auth";
import { type Category, type Product, parseCategoryInput } from "@/lib/dashboard/catalog";

const categories = () => client.db().collection<Category>("categories");
const products = () => client.db().collection<Product>("products");

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeCategoryRequest(request, "PATCH");
  if ("error" in access) return access.error;
  const data = parseCategoryInput(await request.json().catch(() => null));
  if (!data)
    return Response.json({ error: "Enter a category name, valid slug, description, and status." }, { status: 400 });
  const { id } = await params;
  try {
    await ensureCategoryIndexes();
    const item = await categories().findOneAndUpdate(
      { id },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!item) return Response.json({ error: "Category not found." }, { status: 404 });
    return Response.json({ item: serializeCategory(item) });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000)
      return Response.json({ error: "That category slug already exists." }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeCategoryRequest(request, "DELETE");
  if ("error" in access) return access.error;
  const { id } = await params;
  const references = await products().countDocuments({ categories: id }, { limit: 1 });
  if (references)
    return Response.json(
      { error: "This category is assigned to one or more products. Remove it from those products before deleting it." },
      { status: 409 },
    );
  const removed = await categories().deleteOne({ id });
  return removed.deletedCount
    ? Response.json({ ok: true })
    : Response.json({ error: "Category not found." }, { status: 404 });
}
