/*
|-----------------------------------------
| setting up RenderItem.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

"use client";

import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/all-icons/all-icons";
import { Button } from "@/components/ui/button";
import { CART_DRAWER_OPEN_EVENT } from "@/lib/cart";

import { addContainerItemToCart } from "./cart";
import { IContainerData, TemplateItem, templateImagePlaceholder } from "./data";
import { fireContainer1AddToCartGtmEvent } from "./gtm-event-fire";

interface RenderItemProps {
  item: TemplateItem;
  settings: IContainerData;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

const RenderItem = ({ item, settings, priority = false, loading }: RenderItemProps) => {
  const detailUrl = item.url || (item.sourceProductId ? `/template?id=${item.sourceProductId}` : "#");

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!item.sourceProductId) {
      window.dispatchEvent(
        new CustomEvent("speed-box:toast", { detail: { message: "This item is not linked to an active product." } }),
      );
      return;
    }
    fireContainer1AddToCartGtmEvent(item, settings);
    addContainerItemToCart({
      productId: item.sourceProductId,
      source: "dashboard",
      title: item.title,
      price: item.price,
      image: item.image || templateImagePlaceholder,
    });
    window.dispatchEvent(new CustomEvent("speed-box:toast", { detail: { message: "Added to cart." } }));
    window.dispatchEvent(new CustomEvent(CART_DRAWER_OPEN_EVENT));
  };

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-sm border border-[#eadfca] bg-white transition duration-500 hover:border-amber-300 hover:shadow-sm">
      {/* Shimmer accent line */}
      <span className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-amber-300 transition duration-500 group-hover:scale-x-100" />

      {/* Image block - fixed aspect ratio container with object-contain to render fully without cropping */}
      <Link href={detailUrl} className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#faf8f5]">
        <Image
          src={item.image || templateImagePlaceholder}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
          priority={priority}
          loading={priority ? "eager" : (loading ?? "lazy")}
          unoptimized
        />

        {/* Hover overlay with preview icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/15 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover:opacity-100">
          <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/95 text-blue-600 shadow-md transition-transform duration-300 group-hover:scale-100">
            <Icon name="Eye" />
          </span>
        </div>
      </Link>

      {/* Content - flex-1 with uniform row heights and pinned buttons */}
      <div className="flex min-h-0 flex-1 flex-col p-3">
        {/* Title - uniform fixed height for 1 or 2 lines */}
        <div className="h-10 md:h-11">
          <h3
            className="line-clamp-2 text-xs font-medium text-gray-800 transition-colors duration-200 group-hover:text-blue-700 md:text-sm leading-snug"
            title={item.title}
          >
            {item.title}
          </h3>
        </div>

        {/* Rating row - uniform height */}
        <div className="mt-1 flex h-4 items-center text-[11px] text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i < item.rating ? "★" : "☆"}</span>
          ))}
        </div>

        {/* Price row - uniform fixed height and baseline */}
        <div className="mt-2 flex h-7 items-center justify-between md:h-8">
          <span className="text-sm font-bold text-blue-600 transition-colors duration-200 group-hover:text-blue-700 md:text-lg leading-none">
            {item.price}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
            <Icon name="Eye" /> {item.views}
          </span>
        </div>

        {/* Action Buttons - pinned to bottom with mt-auto and identical height */}
        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <Button
            disabled={!item.sourceProductId}
            size="sm"
            type="button"
            onClick={handleBuyNow}
            className="h-9 flex-1 cursor-pointer rounded-sm bg-amber-100 text-xs font-medium text-amber-950 transition duration-300 hover:bg-amber-200 md:text-sm"
          >
            <Icon name="ShoppingCart" />
            {settings?.buyButtonText || "Buy Now"}
          </Button>
          <Link
            href={detailUrl}
            aria-label={`View details of ${item.title}`}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-[#eadfca] text-stone-600 transition duration-300 hover:bg-amber-100"
          >
            <Icon name="Eye" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RenderItem;
