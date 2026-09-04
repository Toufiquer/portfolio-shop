/*
|-----------------------------------------
| setting up Mutation.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

"use client";

import {
  Eye,
  GripVertical,
  ImageOff,
  LayoutGrid,
  Loader2,
  PackagePlus,
  Save,
  Settings2,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";

import {
  ContainerGridLayout,
  ContainerMobileGridLayout,
  ContainerSortMode,
  defaultDataContainer2,
  IContainerData,
  TemplateItem,
  templateImagePlaceholder,
} from "./data";

export interface ContainerFormProps {
  data?: IContainerData;
  onSubmit: (values: IContainerData) => void;
}

interface ProductItem {
  _id?: string;
  title?: string;
  productUID?: string;
  real_price?: number;
  discount_price?: number;
  primary_images?: {
    url?: string;
    name?: string;
  };
  star?: number;
  view?: string;
  liveUrl?: string;
}

interface ProductsResponse {
  data?: {
    products?: ProductItem[];
  };
}

const inputClass =
  "w-full rounded-sm border border-[#eadfca] bg-white px-3 py-2 text-sm text-stone-800 outline-none transition duration-700 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-600";
const panelClass = "rounded-sm border border-[#eadfca] bg-white text-stone-800";
const primaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm bg-emerald-100 px-3 text-sm font-semibold text-emerald-950 transition duration-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50";
const darkButtonClass =
  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-[#eadfca] bg-amber-100 px-3 text-sm font-semibold text-amber-950 transition duration-700 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50";

const normalizeSettings = (data?: IContainerData): IContainerData => ({
  ...defaultDataContainer2,
  ...data,
  title: data?.title || data?.sectionTitle || defaultDataContainer2.title,
  sortMode: data?.sortMode || defaultDataContainer2.sortMode,
  gridLayout: data?.gridLayout || defaultDataContainer2.gridLayout,
  mobileGridLayout: data?.mobileGridLayout || defaultDataContainer2.mobileGridLayout,
  showSeeMore: data?.showSeeMore ?? defaultDataContainer2.showSeeMore,
  showBottomNavigation: data?.showBottomNavigation ?? defaultDataContainer2.showBottomNavigation,
  seeMore: {
    ...defaultDataContainer2.seeMore,
    ...(data?.seeMore || {}),
    name: data?.seeMore?.name || data?.viewMoreText || defaultDataContainer2.seeMore.name,
  },
  templates: data?.templates?.length ? data.templates : defaultDataContainer2.templates,
});

const nextId = (items: TemplateItem[]) => Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;

const getProductPrice = (product: ProductItem) => {
  const value = Number(product.discount_price || product.real_price || 0);
  return value ? `${value.toLocaleString()}৳` : "0৳";
};

const getProductImage = (product: ProductItem) => product.primary_images?.url || templateImagePlaceholder;

const getProductKey = (product: ProductItem) => product._id || product.productUID || product.title || "";

const productToTemplate = (product: ProductItem, id: number): TemplateItem => ({
  id,
  sourceProductId: product._id,
  productUID: product.productUID || "",
  title: product.title || "Untitled Product",
  price: getProductPrice(product),
  views: product.view || "0",
  rating: Math.min(5, Math.max(0, Number(product.star) || 5)),
  image: getProductImage(product),
  url: product.liveUrl || (product._id ? `/template?id=${product._id}` : ""),
});

const sortTemplates = (templates: TemplateItem[], sortMode: ContainerSortMode) => {
  if (sortMode === "custom") return templates;
  return [...templates].sort((a, b) => {
    const result = a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
    return sortMode === "ascending" ? result : -result;
  });
};

const gridLayoutColumnCount: Record<ContainerGridLayout, number> = {
  "1x1": 1,
  "1x2": 2,
  "1x3": 3,
};

const mobileLayoutColumnCount: Record<ContainerMobileGridLayout, number> = {
  "1x1": 1,
  "1x2": 2,
};

const LayoutPreviewIcon = ({ columns, accent }: { columns: number; accent: boolean }) => (
  <span className="grid h-6 w-9 grid-flow-col gap-[3px]" aria-hidden="true">
    {Array.from({ length: columns }).map((_, index) => (
      <span key={index} className={`rounded-[3px] transition-colors ${accent ? "bg-amber-300" : "bg-white/30"}`} />
    ))}
  </span>
);

const mutationGridLayoutClasses: Record<ContainerGridLayout, string> = {
  "1x1": "grid-cols-1",
  "1x2": "grid-cols-1 sm:grid-cols-2",
  "1x3": "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
};

const cardImageSizeClasses: Record<ContainerGridLayout, string> = {
  "1x1": "aspect-square w-24 shrink-0 sm:w-28",
  "1x2": "aspect-[4/3] w-full",
  "1x3": "aspect-[4/3] w-full",
};

const RatingStars = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={11}
        className={index < Math.round(rating) ? "fill-amber-300 text-amber-300" : "fill-white/10 text-stone-400"}
      />
    ))}
  </span>
);

const MutationContainer2 = ({ data, onSubmit }: ContainerFormProps) => {
  const [settings, setSettings] = useState<IContainerData>(() => normalizeSettings(data));
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isRemoveAllOpen, setIsRemoveAllOpen] = useState(false);
  const [toast, setToast] = useState<{ error?: boolean; message: string } | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const sortedTemplates = useMemo(
    () => sortTemplates(settings.templates, settings.sortMode),
    [settings.sortMode, settings.templates],
  );
  const importedProductsGridClassName =
    mutationGridLayoutClasses[settings.gridLayout] || mutationGridLayoutClasses[defaultDataContainer2.gridLayout];
  const importedProductKeys = useMemo(() => {
    const keys = new Set<string>();
    settings.templates.forEach((item) => {
      if (item.sourceProductId) keys.add(item.sourceProductId);
      if (item.productUID) keys.add(item.productUID);
      if (item.title) keys.add(item.title);
    });
    return keys;
  }, [settings.templates]);
  const isProductAlreadyAdded = useCallback(
    (product: ProductItem) =>
      Boolean(
        (product._id && importedProductKeys.has(product._id)) ||
        (product.productUID && importedProductKeys.has(product.productUID)) ||
        (product.title && importedProductKeys.has(product.title)),
      ),
    [importedProductKeys],
  );
  const productKeys = useMemo(() => products.map(getProductKey).filter(Boolean), [products]);
  const allProductsChecked = productKeys.length > 0 && productKeys.every((key) => selectedProductIds.includes(key));
  const newSelectedProductCount = products.filter((product) => {
    const key = getProductKey(product);
    return key && selectedProductIds.includes(key) && !isProductAlreadyAdded(product);
  }).length;

  useEffect(() => {
    if (!isImportOpen || products.length > 0) return;

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch("/api/products/v1?page=1&limit=1000");
        const result = (await response.json()) as ProductsResponse;
        setProducts(result?.data?.products || []);
      } catch {
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void fetchProducts();
  }, [isImportOpen, products.length]);

  const updateSettings = (patch: Partial<IContainerData>) => setSettings((prev) => ({ ...prev, ...patch }));

  const openImporter = () => {
    setSelectedProductIds(
      products.map((product) => (isProductAlreadyAdded(product) ? getProductKey(product) : "")).filter(Boolean),
    );
    setIsImportOpen(true);
  };

  const updateSortMode = (sortMode: ContainerSortMode) => {
    setSettings((prev) => ({
      ...prev,
      sortMode,
      templates: sortTemplates(prev.templates, sortMode),
    }));
  };

  const moveTemplate = (fromId: number, toId: number) => {
    if (fromId === toId) return;
    setSettings((prev) => {
      const next = [...prev.templates];
      const fromIndex = next.findIndex((item) => item.id === fromId);
      const toIndex = next.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, sortMode: "custom", templates: next };
    });
  };

  const removeTemplate = (id: number) => {
    setSettings((prev) => ({ ...prev, templates: prev.templates.filter((template) => template.id !== id) }));
    setToast({ message: "Product removed." });
  };

  const removeAllTemplates = () => {
    setSettings((prev) => ({ ...prev, templates: [] }));
    setIsRemoveAllOpen(false);
    setToast({ message: "All products removed." });
  };

  const toggleProductSelection = (id: string, checked: boolean) => {
    setSelectedProductIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id)));
  };

  const checkAllProducts = () => {
    setSelectedProductIds(productKeys);
  };

  const importSelectedProducts = () => {
    setSettings((prev) => {
      const existingSourceIds = new Set(prev.templates.map((item) => item.sourceProductId).filter(Boolean));
      const existingProductUids = new Set(prev.templates.map((item) => item.productUID).filter(Boolean));
      const existingTitles = new Set(prev.templates.map((item) => item.title).filter(Boolean));
      const selectedProducts = products.filter((product) => {
        const key = getProductKey(product);
        if (!key || !selectedProductIds.includes(key)) return false;
        return !(
          (product._id && existingSourceIds.has(product._id)) ||
          (product.productUID && existingProductUids.has(product.productUID)) ||
          (product.title && existingTitles.has(product.title))
        );
      });
      let idSeed = nextId(prev.templates);
      const importedTemplates = selectedProducts.map((product) => productToTemplate(product, idSeed++));
      return { ...prev, templates: [...prev.templates, ...importedTemplates] };
    });
    setSelectedProductIds([]);
    setIsImportOpen(false);
    setToast({ message: "Products imported." });
  };

  const submit = () => {
    try {
      onSubmit({
        ...settings,
        sectionTitle: settings.title,
        viewMoreText: settings.seeMore.name,
      });
      setToast({ message: "Container saved." });
    } catch {
      setToast({ error: true, message: "Could not save the container." });
    }
  };

  return (
    <div className="custom-parent-border px-4 rounded-2xl bg-[#fffaf0] text-stone-800">
      <div className={panelClass}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className={labelClass}>Title</label>
            <input
              value={settings.title}
              onChange={(event) => updateSettings({ title: event.target.value })}
              className={`${inputClass} mt-1.5`}
              placeholder="All Theme"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={openImporter} className={darkButtonClass}>
              <PackagePlus size={16} /> Import Product
            </button>
            <button type="button" onClick={submit} className={primaryButtonClass}>
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-[#eadfca] pt-5 md:grid-cols-[1fr_1fr_auto_auto]">
          <div>
            <label className={labelClass}>See More Name</label>
            <input
              value={settings.seeMore.name}
              onChange={(event) => updateSettings({ seeMore: { ...settings.seeMore, name: event.target.value } })}
              className={`${inputClass} mt-1.5`}
              placeholder="See More"
            />
          </div>
          <div>
            <label className={labelClass}>See More URL</label>
            <input
              value={settings.seeMore.url}
              onChange={(event) => updateSettings({ seeMore: { ...settings.seeMore, url: event.target.value } })}
              className={`${inputClass} mt-1.5`}
              placeholder="/all-container"
            />
          </div>
          <div className="flex items-end">
            <label className="flex h-[42px] w-full items-center justify-between gap-3 rounded-xl border border-[#eadfca] bg-stone-100 px-3.5 text-sm font-bold text-stone-800 md:w-auto">
              <span className="whitespace-nowrap">Show See More</span>
              <Switch
                checked={settings.showSeeMore}
                onCheckedChange={(checked) => updateSettings({ showSeeMore: checked })}
              />
            </label>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={submit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-bold text-stone-800 shadow-lg shadow-emerald-600/30 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Settings2 size={16} /> Update See More
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-[#eadfca] pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="font-bold leading-tight text-stone-800">Imported Products</h3>
              <p className="text-xs text-stone-500">
                {settings.templates.length} item{settings.templates.length === 1 ? "" : "s"} · drag to reorder in custom
                sort
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-stretch gap-2.5">
            <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[#eadfca] bg-stone-100 px-3.5 text-sm font-bold text-stone-800">
              <span className="whitespace-nowrap">Bottom Nav</span>
              <Switch
                checked={settings.showBottomNavigation}
                onCheckedChange={(checked) => updateSettings({ showBottomNavigation: checked })}
              />
            </label>

            <button
              type="button"
              onClick={() => setIsRemoveAllOpen(true)}
              disabled={settings.templates.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition-colors hover:bg-red-500/20 hover:text-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={15} /> Remove All
            </button>

            <div className="flex items-center gap-1.5 rounded-xl border border-[#eadfca] bg-stone-100 p-1.5">
              <LayoutGrid size={13} className="ml-1 text-stone-500" />
              {(["1x1", "1x2", "1x3"] as ContainerGridLayout[]).map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => updateSettings({ gridLayout: layout })}
                  title={`Grid: ${layout.replace("x", " \u00d7 ")}`}
                  className={`flex h-9 w-11 items-center justify-center rounded-lg transition-all ${
                    settings.gridLayout === layout
                      ? "bg-amber-400/20 ring-1 ring-inset ring-amber-300/50"
                      : "hover:bg-stone-100"
                  }`}
                  aria-label={`Set view grid ${layout.replace("x", " by ")}`}
                  aria-pressed={settings.gridLayout === layout}
                >
                  <LayoutPreviewIcon columns={gridLayoutColumnCount[layout]} accent={settings.gridLayout === layout} />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-[#eadfca] bg-stone-100 p-1.5">
              <Smartphone size={13} className="ml-1 text-stone-500" />
              {(["1x1", "1x2"] as ContainerMobileGridLayout[]).map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => updateSettings({ mobileGridLayout: layout })}
                  title={`Mobile: ${layout.replace("x", " \u00d7 ")}`}
                  className={`flex h-9 w-11 items-center justify-center rounded-lg transition-all ${
                    settings.mobileGridLayout === layout
                      ? "bg-amber-400/20 ring-1 ring-inset ring-amber-300/50"
                      : "hover:bg-stone-100"
                  }`}
                  aria-label={`Set mobile view ${layout.replace("x", " by ")}`}
                  aria-pressed={settings.mobileGridLayout === layout}
                >
                  <LayoutPreviewIcon
                    columns={mobileLayoutColumnCount[layout]}
                    accent={settings.mobileGridLayout === layout}
                  />
                </button>
              ))}
            </div>

            <select
              value={settings.sortMode}
              onChange={(event) => updateSortMode(event.target.value as ContainerSortMode)}
              className="rounded-xl border border-[#eadfca] bg-stone-100 px-3.5 py-2 text-sm font-medium text-stone-800 outline-none transition-colors focus:border-amber-300/60"
            >
              <option value="ascending">A → Z</option>
              <option value="descending">Z → A</option>
              <option value="custom">Custom order</option>
            </select>
          </div>
        </div>

        {sortedTemplates.length === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
              <ImageOff size={22} />
            </span>
            <div>
              <p className="font-semibold text-stone-700">No products yet</p>
              <p className="mt-1 text-sm text-stone-500">Import products to populate this section.</p>
            </div>
            <button type="button" onClick={openImporter} className={`${darkButtonClass} mt-1`}>
              <PackagePlus size={16} /> Import Product
            </button>
          </div>
        ) : (
          <div className={`mt-5 grid auto-rows-fr items-stretch gap-4 ${importedProductsGridClassName}`}>
            {sortedTemplates.map((item) => {
              const isCustomSort = settings.sortMode === "custom";
              const isDragging = draggedId === item.id;
              const isDragTarget = dragOverId === item.id && draggedId !== item.id;
              const isCompact = settings.gridLayout === "1x1";

              return (
                <div
                  key={item.id}
                  draggable={isCustomSort}
                  onDragStart={() => setDraggedId(item.id)}
                  onDragEnter={() => isCustomSort && setDragOverId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  onDrop={() => {
                    if (draggedId) moveTemplate(draggedId, item.id);
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  className={`group relative min-w-0 overflow-hidden rounded-xl border bg-stone-50 backdrop-blur-md transition-all duration-200 ${
                    isCompact ? "flex min-h-28 items-center gap-3 p-2.5" : "flex h-full flex-col"
                  } ${
                    isDragging
                      ? "scale-[0.97] border-amber-300/40 opacity-50"
                      : isDragTarget
                        ? "border-amber-300/60 ring-2 ring-amber-300/30"
                        : "border-[#eadfca] hover:-translate-y-0.5 hover:border-[#eadfca] hover:shadow-xl hover:shadow-black/30"
                  }`}
                >
                  <div
                    className={`relative shrink-0 overflow-hidden bg-stone-100 ${isCompact ? cardImageSizeClasses["1x1"] : cardImageSizeClasses[settings.gridLayout]}`}
                  >
                    <Image
                      src={item.image || templateImagePlaceholder}
                      alt={item.title || "Product image"}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    {!isCompact && (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
                    )}

                    {isCustomSort && (
                      <span
                        className={`absolute flex items-center justify-center rounded-md bg-stone-900/10 text-stone-700 backdrop-blur-sm active:cursor-grabbing ${
                          isCompact ? "left-0.5 top-0.5 h-5 w-5 cursor-grab" : "left-2 top-2 h-7 w-7 cursor-grab"
                        }`}
                      >
                        <GripVertical size={isCompact ? 11 : 14} />
                      </span>
                    )}

                    {!isCompact && (
                      <button
                        type="button"
                        onClick={() => removeTemplate(item.id)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-stone-900/10 text-red-300 backdrop-blur-sm transition-colors hover:bg-red-500/80 hover:text-stone-800"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {!isCompact && (
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="rounded-md bg-stone-900/10 px-2 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm">
                          {item.price}
                        </span>
                        <span className="flex items-center gap-1 rounded-md bg-stone-900/10 px-2 py-1 text-[11px] font-medium text-stone-700 backdrop-blur-sm">
                          <Eye size={11} /> {item.views}
                        </span>
                      </div>
                    )}
                  </div>

                  {isCompact ? (
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold leading-snug text-stone-800">
                          {item.title || "Untitled Product"}
                        </h4>
                        <div className="mt-1 flex items-center gap-2">
                          <RatingStars rating={item.rating} />
                          <span className="flex items-center gap-1 text-[11px] text-stone-500">
                            <Eye size={11} /> {item.views}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-bold text-amber-300">{item.price}</span>
                        <button
                          type="button"
                          onClick={() => removeTemplate(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-200 transition-colors hover:bg-red-500/20 hover:text-stone-800"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col gap-1.5 p-3">
                      <h4 className="min-h-10 line-clamp-2 text-sm font-semibold leading-snug text-stone-800">
                        {item.title || "Untitled Product"}
                      </h4>
                      <div className="flex items-center justify-between">
                        <RatingStars rating={item.rating} />
                        <span className="truncate text-[11px] text-stone-500">{item.productUID || "N/A"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTemplate(item.id)}
                        className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 transition-colors hover:bg-red-500/20 hover:text-stone-800"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog
        description={`This will remove all ${settings.templates.length} imported item${settings.templates.length === 1 ? "" : "s"} from this container.`}
        onCancel={() => setIsRemoveAllOpen(false)}
        onConfirm={removeAllTemplates}
        open={isRemoveAllOpen}
        title="Remove all items?"
      />

      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#eadfca] bg-white text-stone-800 shadow-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,180,254,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_40%)]" />
            <div className="relative flex items-start justify-between gap-4 border-b border-stone-200 bg-stone-50 p-5">
              <div>
                <h3 className="text-lg font-bold text-stone-800">Import Product</h3>
                <p className="mt-0.5 text-sm text-stone-500">Select products to import into this Container section.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-800"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto p-5">
              {isLoadingProducts ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-stone-500">
                  <Loader2 className="h-5 w-5 animate-spin text-fuchsia-300" />
                  <span className="text-sm">Loading products…</span>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#eadfca] bg-stone-50 p-10 text-center text-stone-500">
                  No products found.
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{selectedProductIds.length} checked</p>
                      <p className="text-xs text-stone-500">
                        {newSelectedProductCount} new product{newSelectedProductCount === 1 ? "" : "s"} ready to import
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={checkAllProducts}
                      disabled={allProductsChecked}
                      className="inline-flex items-center justify-center rounded-xl border border-fuchsia-200/25 bg-fuchsia-50 px-4 py-2 text-sm font-bold text-fuchsia-900 shadow-lg shadow-stone-900/10 transition-all hover:bg-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      Check All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {products.map((product) => {
                      const productId = getProductKey(product);
                      const isSelected = selectedProductIds.includes(productId);
                      const isAlreadyAdded = isProductAlreadyAdded(product);
                      return (
                        <label
                          key={productId}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-2.5 transition-all ${
                            isSelected
                              ? "border-fuchsia-300/50 bg-fuchsia-50 shadow-lg shadow-stone-900/10"
                              : "border-stone-200 bg-stone-50 hover:border-purple-200/25 hover:bg-stone-100"
                          }`}
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-stone-200 bg-white/5">
                            <Image
                              src={getProductImage(product)}
                              alt={product.title || "Product image"}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-stone-800">
                              {product.title || "Untitled Product"}
                            </span>
                            <span className="block text-xs text-stone-500">UID: {product.productUID || "N/A"}</span>
                            {isAlreadyAdded && (
                              <span className="mt-1 inline-flex rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                                Already added
                              </span>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => toggleProductSelection(productId, event.target.checked)}
                            className="h-4 w-4 shrink-0 accent-fuchsia-400"
                          />
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="relative flex items-center justify-between gap-2 border-t border-stone-200 bg-stone-50 p-5">
              <span className="text-xs text-stone-500">
                {selectedProductIds.length} checked · {newSelectedProductCount} new
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="rounded-xl border border-[#eadfca] bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-800 backdrop-blur-md transition-colors hover:bg-white/[0.12]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={importSelectedProducts}
                  disabled={newSelectedProductCount === 0}
                  className="rounded-xl bg-gradient-to-b from-amber-100 to-amber-200 px-4 py-2.5 text-sm font-bold text-stone-800 shadow-lg shadow-amber-200/60 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
                >
                  Import {newSelectedProductCount > 0 ? `(${newSelectedProductCount})` : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast ? <Toast error={toast.error} message={toast.message} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
};

export default MutationContainer2;
