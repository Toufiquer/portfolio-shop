/*
|-----------------------------------------
| setting up server.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 07 September, 2026
|-----------------------------------------
*/

import "server-only";

import { unstable_cache } from "next/cache";

import { client } from "@/app/api/lib/auth";
import type { Category, Product } from "@/lib/dashboard/catalog";

export const productCatalogCacheTag = "public-product-catalog";
export const productCategoryCacheTag = "public-product-categories";

const products = () => client.db().collection<Product>("products");
const categories = () => client.db().collection<Category>("categories");

const activeCategories = () =>
  unstable_cache(
    () =>
      categories()
        .find({ status: "active" }, { projection: { _id: 0 } })
        .sort({ name: 1 })
        .toArray(),
    ["public-product-categories"],
    { revalidate: false, tags: [productCategoryCacheTag] },
  )();

export const getPublicCategories = activeCategories;

export async function getPublicProducts(categorySlug?: string) {
  const category = categorySlug
    ? (await activeCategories()).find((item) => item.slug === categorySlug.toLowerCase())
    : undefined;
  if (categorySlug && !category) return { category: null, items: [] as Product[] };
  const categoryId = category?.id ?? "all";
  const items = await unstable_cache(
    () =>
      products()
        .find({ status: "active", ...(category ? { categories: category.id } : {}) }, { projection: { _id: 0 } })
        .sort({ isFeatured: -1, updatedAt: -1, name: 1 })
        .toArray(),
    ["public-products", categoryId],
    { revalidate: false, tags: [productCatalogCacheTag, productCategoryCacheTag] },
  )();
  return { category: category ?? null, items };
}

export function getPublicProduct(slug: string) {
  return unstable_cache(
    () => products().findOne({ slug: slug.toLowerCase(), status: "active" }, { projection: { _id: 0 } }),
    ["public-product", slug.toLowerCase()],
    { revalidate: false, tags: [productCatalogCacheTag] },
  )();
}

export function plainProductDescription(value: string) {
  try {
    const texts: string[] = [];
    const collect = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const entry = node as { text?: unknown; children?: unknown };
      if (typeof entry.text === "string") texts.push(entry.text);
      if (Array.isArray(entry.children)) entry.children.forEach(collect);
    };
    collect(JSON.parse(value));
    return texts.join("\n").trim() || value;
  } catch {
    return value.replace(/<[^>]*>/g, "");
  }
}
