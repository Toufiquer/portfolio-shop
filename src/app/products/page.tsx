/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 07 September, 2026
|-----------------------------------------
*/

import { ArrowRight, PackageOpen, Sparkles, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublicCategories, getPublicProducts } from "@/lib/products/server";

export const metadata: Metadata = { title: "Products", description: "Explore our curated technology collection." };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: requestedCategory } = await searchParams;
  const categorySlug = requestedCategory?.trim().toLowerCase();
  const [{ items, category }, categories] = await Promise.all([getPublicProducts(categorySlug), getPublicCategories()]);
  const title = category ? category.name : "Discover what moves you";
  return (
    <main className="min-h-screen bg-[#fffdf8] text-stone-900">
      <section className="overflow-hidden border-b border-amber-100 bg-[radial-gradient(circle_at_12%_0%,#fde8bc,transparent_34%),radial-gradient(circle_at_92%_30%,#fee2d1,transparent_30%)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
          <div>
            <p className="text-sm font-bold text-stone-500">
              {items.length} {items.length === 1 ? "product" : "products"} Found
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <nav
              aria-label="Product categories"
              className="overflow-x-auto rounded-sm bg-white p-3 ring-1 ring-stone-200 lg:overflow-visible"
            >
              <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Categories</p>
              <div className="flex gap-2 lg:flex-col">
                <Link
                  className={`whitespace-nowrap rounded-sm px-3 py-2.5 text-sm font-semibold transition ${!categorySlug ? "bg-stone-950 text-white" : "text-stone-600 hover:bg-amber-50 hover:text-stone-950"}`}
                  href="/products"
                >
                  All products
                </Link>
                {categories.map((item) => (
                  <Link
                    className={`whitespace-nowrap rounded-sm px-3 py-2.5 text-sm font-semibold transition ${category?.id === item.id ? "bg-stone-950 text-white" : "text-stone-600 hover:bg-amber-50 hover:text-stone-950"}`}
                    href={`/products?category=${item.slug}`}
                    key={item.id}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
          <div className="min-w-0">
            <div className="mb-7 flex items-end justify-between gap-4"></div>
            {items.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((product) => (
                  <Link
                    className="group overflow-hidden rounded-sm bg-white ring-1 ring-stone-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/10"
                    href={`/products/${product.slug}`}
                    key={product.id}
                  >
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50">
                      {product.primaryImage && (
                        <Image
                          alt={product.name}
                          className="object-contain p-7 transition duration-500 group-hover:scale-105"
                          fill
                          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          src={product.primaryImage}
                          unoptimized
                        />
                      )}
                      {product.discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
                          -{Math.round(product.discount)}%
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="truncate text-xs font-bold uppercase tracking-wider text-amber-700">
                        {product.brand}
                      </p>
                      <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-bold leading-6">{product.name}</h3>
                      <div className="mt-3 flex items-center gap-1 text-sm text-amber-600">
                        <Star className="fill-current" size={15} /> {product.star.toFixed(1)}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-black">৳{product.discountPrice.toLocaleString("en-BD")}</span>
                        <ArrowRight className="transition group-hover:translate-x-1" size={18} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid min-h-72 place-items-center rounded-sm border border-dashed border-stone-300 bg-white p-8 text-center">
                <div>
                  <PackageOpen className="mx-auto text-amber-600" size={36} />
                  <h2 className="mt-4 text-xl font-bold">No active products here yet</h2>
                  <p className="mt-2 text-sm text-stone-500">
                    Choose another category or check back after the catalog is published.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
