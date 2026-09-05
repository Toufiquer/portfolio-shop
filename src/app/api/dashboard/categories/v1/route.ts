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
import { type Category, parseCategoryInput } from "@/lib/dashboard/catalog";

const categories = () => client.db().collection<Category>("categories");
export const serializeCategory = (item: Category) => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

export async function authorizeCategoryRequest(request: Request, method: "GET" | "POST" | "PATCH" | "DELETE") {
  const limited = await rateLimitDistributed(request, "dashboard-categories-api", 60, 60_000);
  if (limited) return { error: limited };
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };
  const allowed = await authorizeDashboardRequest(session, "/api/dashboard/categories/v1", method);
  return allowed.allowed
    ? {}
    : { error: Response.json({ error: allowed.state.message ?? "Unauthorized." }, { status: 403 }) };
}

export async function ensureCategoryIndexes() {
  await categories().createIndex({ slug: 1 }, { name: "category_slug_unique", unique: true });
}

export async function GET(request: Request) {
  const access = await authorizeCategoryRequest(request, "GET");
  if ("error" in access) return access.error;
  const items = await categories().find({}).sort({ name: 1 }).toArray();
  return Response.json({ items: items.map(serializeCategory) });
}

export async function POST(request: Request) {
  const access = await authorizeCategoryRequest(request, "POST");
  if ("error" in access) return access.error;
  const data = parseCategoryInput(await request.json().catch(() => null));
  if (!data)
    return Response.json({ error: "Enter a category name, valid slug, description, and status." }, { status: 400 });
  const now = new Date();
  const item: Category = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
  try {
    await ensureCategoryIndexes();
    await categories().insertOne(item);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000)
      return Response.json({ error: "That category slug already exists." }, { status: 409 });
    throw error;
  }
  return Response.json({ item: serializeCategory(item) }, { status: 201 });
}
