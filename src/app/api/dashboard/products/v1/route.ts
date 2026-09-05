/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { MongoServerError } from "mongodb";

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import {
  type Category,
  type Product,
  type ProductInput,
  type ProductStatus,
  parseProductInput,
  productStatuses,
} from "@/lib/dashboard/catalog";

const products = () => client.db().collection<Product>("products");
const categories = () => client.db().collection<Category>("categories");
export const serializeProduct = (item: Product) => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

export async function authorizeProductRequest(request: Request, method: "GET" | "POST" | "PATCH" | "DELETE") {
  const limited = await rateLimitDistributed(request, "dashboard-products-api", 60, 60_000);
  if (limited) return { error: limited };
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };
  const allowed = await authorizeDashboardRequest(session, "/api/dashboard/products/v1", method);
  return allowed.allowed
    ? {}
    : { error: Response.json({ error: allowed.state.message ?? "Unauthorized." }, { status: 403 }) };
}

export async function ensureProductIndexes() {
  await Promise.all([
    products().createIndex({ slug: 1 }, { name: "product_slug_unique", unique: true }),
    products().createIndex({ sku: 1 }, { name: "product_sku_unique", unique: true }),
    products().createIndex({ categories: 1 }, { name: "product_categories_index" }),
  ]);
}

export async function validateProductCategories(categoryIds: string[]) {
  const found = await categories().countDocuments({ id: { $in: categoryIds } });
  return found === categoryIds.length;
}

export function duplicateProductError(error: unknown) {
  if (!(error instanceof MongoServerError) || error.code !== 11000) return null;
  return error.keyPattern?.sku ? "That SKU already exists." : "That product slug already exists.";
}

function integer(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}

function searchPattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  const access = await authorizeProductRequest(request, "GET");
  if ("error" in access) return access.error;
  const query = new URL(request.url).searchParams;
  const page = integer(query.get("page"), 1, 1, 10_000);
  const limit = integer(query.get("limit"), 10, 1, 100);
  const status = query.get("status");
  const category = query.get("category")?.trim();
  const search = query.get("search")?.trim();
  const filter: Record<string, unknown> = {};
  if (productStatuses.includes(status as ProductStatus)) filter.status = status;
  if (category) filter.categories = category;
  if (search) {
    const expression = new RegExp(searchPattern(search), "i");
    filter.$or = [{ name: expression }, { slug: expression }, { sku: expression }];
  }
  const [items, total] = await Promise.all([
    products()
      .find(filter)
      .sort({ updatedAt: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    products().countDocuments(filter),
  ]);
  return Response.json({
    items: items.map(serializeProduct),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

export async function POST(request: Request) {
  const access = await authorizeProductRequest(request, "POST");
  if ("error" in access) return access.error;
  const data = parseProductInput(await request.json().catch(() => null));
  if (!data)
    return Response.json({ error: "Enter valid product details, images, prices, stock, and status." }, { status: 400 });
  if (!(await validateProductCategories(data.categories)))
    return Response.json({ error: "Select only existing categories." }, { status: 400 });
  const now = new Date();
  const item: Product = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
  try {
    await ensureProductIndexes();
    await products().insertOne(item);
  } catch (error) {
    const message = duplicateProductError(error);
    if (message) return Response.json({ error: message }, { status: 409 });
    throw error;
  }
  return Response.json({ item: serializeProduct(item) }, { status: 201 });
}

export type { ProductInput };
