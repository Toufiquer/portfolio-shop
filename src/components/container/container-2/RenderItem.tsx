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
import { useRouter } from "next/navigation";

import { Icon } from "@/components/all-icons/all-icons";
import { Button } from "@/components/ui/button";

import { addContainerItemToCart } from "./cart";
import { IContainerData, TemplateItem, templateImagePlaceholder } from "./data";

interface RenderItemProps {
  item: TemplateItem;
  settings: IContainerData;
}

const RenderItem = ({ item, settings }: RenderItemProps) => {
  const router = useRouter();
  const detailUrl = item.url || `/template?id=${item.id}`;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addContainerItemToCart({
      productId: item.id,
      containerUid: settings.containerUid,
      containerName: settings.containerName,
      title: item.title,
      price: item.price,
      image: item.image || templateImagePlaceholder,
    });
    window.dispatchEvent(new CustomEvent("speed-box:toast", { detail: { message: "Redirecting..." } }));
    router.push("/cart");
  };

  return (
    <div className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-sm border border-[#eadfca] bg-white transition duration-700 hover:border-amber-300">
      {/* Shimmer accent line */}
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-amber-300 transition duration-700 group-hover:scale-x-100" />

      {/* Image block */}
      <Link href={detailUrl} className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-100">
        <Image
          src={item.image || templateImagePlaceholder}
          alt={item.title}
          width={720}
          height={540}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          unoptimized
        />

        {/* Dark overlay with preview icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-blue-950/0 transition-all duration-300 group-hover:bg-blue-950/30">
          <span className="flex h-10 w-10 scale-0 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-lg transition-all duration-300 group-hover:scale-100">
            <Icon name="Eye" />
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-2.5">
        <h3 className="min-h-[2.5rem] line-clamp-2 text-xs font-medium text-gray-700 transition-colors duration-200 group-hover:text-blue-700 md:min-h-[2.75rem] md:text-sm">
          {item.title}
        </h3>

        <div className="mt-1 flex text-[10px] text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i < item.rating ? "★" : "☆"}</span>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-blue-600 transition-colors duration-200 group-hover:text-blue-700 md:text-lg">
            {item.price}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-gray-400">
            <Icon name="Eye" /> {item.views}
          </span>
        </div>

        {/* Buttons — slide up on hover */}
        <div className="mt-auto flex translate-y-1 gap-1 pt-3 opacity-80 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            size="sm"
            type="button"
            onClick={handleBuyNow}
            className="flex-1 cursor-pointer rounded-sm bg-amber-100 text-amber-950 transition duration-700 hover:bg-amber-200"
          >
            <Icon name="ShoppingCart" />
            Buy Now
          </Button>
          <Link
            href={detailUrl}
            className="flex cursor-pointer items-center justify-center rounded-sm border border-[#eadfca] text-stone-600 transition duration-700 hover:bg-amber-100"
          >
            <Icon name="Eye" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RenderItem;
