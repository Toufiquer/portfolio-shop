/*
|-----------------------------------------
| setting up Query.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Icon } from "@/components/all-icons/all-icons";
import { Button } from "@/components/ui/button";

import {
  containerGridItemWidth,
  containerMobileGridItemWidth,
  ContainerProps,
  defaultDataContainer2,
  IContainerData,
  TemplateItem,
} from "./data";
import RenderItem from "./RenderItem";

const cn = (...classNames: Array<string | false | null | undefined>) => classNames.filter(Boolean).join(" ");

const mobileItemsPerSlide: Record<IContainerData["mobileGridLayout"], number> = {
  "1x1": 1,
  "1x2": 2,
};

const desktopItemsPerSlide: Record<IContainerData["gridLayout"], number> = {
  "1x1": 1,
  "1x2": 2,
  "1x3": 3,
};

const sortTemplates = (templates: TemplateItem[], sortMode: IContainerData["sortMode"]) => {
  if (sortMode === "custom") return templates;
  return [...templates].sort((a, b) => {
    const result = a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
    return sortMode === "ascending" ? result : -result;
  });
};

const normalizeTemplate = (template: Partial<TemplateItem>, index: number): TemplateItem => ({
  id: Number.isFinite(Number(template.id)) ? Number(template.id) : index + 1,
  sourceProductId: typeof template.sourceProductId === "string" ? template.sourceProductId : undefined,
  productUID: typeof template.productUID === "string" ? template.productUID : "",
  title: typeof template.title === "string" && template.title.trim() ? template.title : "Untitled Product",
  price: typeof template.price === "string" ? template.price : "0৳",
  views: typeof template.views === "string" ? template.views : "0",
  rating: Math.min(5, Math.max(0, Number(template.rating) || 0)),
  image:
    typeof template.image === "string" && template.image ? template.image : defaultDataContainer2.templates[0].image,
  url: typeof template.url === "string" ? template.url : "",
  visible: template.visible ?? true,
});

const resolveData = (data?: IContainerData | string): IContainerData => {
  if (!data) return defaultDataContainer2;

  try {
    const parsedData = typeof data === "string" ? (JSON.parse(data) as Partial<IContainerData>) : data;
    const settings = {
      ...defaultDataContainer2,
      ...parsedData,
      title: parsedData.title || parsedData.sectionTitle || defaultDataContainer2.title,
      sortMode: parsedData.sortMode || defaultDataContainer2.sortMode,
      gridLayout: parsedData.gridLayout || defaultDataContainer2.gridLayout,
      mobileGridLayout: parsedData.mobileGridLayout || defaultDataContainer2.mobileGridLayout,
      showSeeMore: parsedData.showSeeMore ?? defaultDataContainer2.showSeeMore,
      showBottomNavigation: parsedData.showBottomNavigation ?? defaultDataContainer2.showBottomNavigation,
      paddingX: String(Math.max(-300, Math.min(300, Number(parsedData.paddingX ?? defaultDataContainer2.paddingX) || 0))),
      paddingY: String(Math.max(-300, Math.min(300, Number(parsedData.paddingY ?? defaultDataContainer2.paddingY) || 0))),
      titleFontFamily: parsedData.titleFontFamily || defaultDataContainer2.titleFontFamily,
      titleFontSize: parsedData.titleFontSize || defaultDataContainer2.titleFontSize,
      titleFontColor: parsedData.titleFontColor || defaultDataContainer2.titleFontColor,
      titleFontWeight: parsedData.titleFontWeight || defaultDataContainer2.titleFontWeight,
      seeMore: {
        ...defaultDataContainer2.seeMore,
        ...(parsedData.seeMore || {}),
        name: parsedData.seeMore?.name || parsedData.viewMoreText || defaultDataContainer2.seeMore.name,
      },
      templates: (parsedData.templates?.length ? parsedData.templates : defaultDataContainer2.templates).map(
        normalizeTemplate,
      ),
    };

    return {
      ...settings,
      templates: sortTemplates(settings.templates, settings.sortMode).filter((template) => template.visible),
    };
  } catch {
    return defaultDataContainer2;
  }
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
};

const QueryContainer2 = ({ data }: ContainerProps) => {
  const settings = useMemo(() => resolveData(data), [data]);
  const isDesktop = useIsDesktop();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const paddingX = Math.max(0, Number(settings.paddingX) || 0);
  const paddingY = Math.max(0, Number(settings.paddingY) || 0);

  const titleStyle: React.CSSProperties = {
    fontFamily: settings.titleFontFamily && settings.titleFontFamily !== "inherit" ? settings.titleFontFamily : undefined,
    fontSize: settings.titleFontSize ? `${settings.titleFontSize}px` : undefined,
    color: settings.titleFontColor || undefined,
    fontWeight: settings.titleFontWeight || undefined,
  };

  const visibleItems = isDesktop
    ? desktopItemsPerSlide[settings.gridLayout] || desktopItemsPerSlide[defaultDataContainer2.gridLayout]
    : mobileItemsPerSlide[settings.mobileGridLayout] || mobileItemsPerSlide[defaultDataContainer2.mobileGridLayout];
  const maxIndex = Math.max(0, settings.templates.length - visibleItems);
  const safeCurrentIndex = Math.min(currentIndex, maxIndex);
  const canSlide = settings.templates.length > visibleItems;
  const shouldShowBottomNavigation = settings.showBottomNavigation && canSlide;
  const itemWidth = isDesktop
    ? containerGridItemWidth[settings.gridLayout] || containerGridItemWidth[defaultDataContainer2.gridLayout]
    : containerMobileGridItemWidth[settings.mobileGridLayout] ||
      containerMobileGridItemWidth[defaultDataContainer2.mobileGridLayout];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const currentIndex = Math.min(prev, maxIndex);
      return currentIndex >= maxIndex ? 0 : currentIndex + 1;
    });
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const currentIndex = Math.min(prev, maxIndex);
      return currentIndex <= 0 ? maxIndex : currentIndex - 1;
    });
  }, [maxIndex]);

  useEffect(() => {
    if (!canSlide || isPaused) return;

    const interval = window.setInterval(nextSlide, 3500);
    return () => window.clearInterval(interval);
  }, [canSlide, isPaused, nextSlide]);

  if (settings.templates.length === 0) return null;

  return (
    <section
      className="custom-parent-border max-w-106.25 md:max-w-7xl w-full bg-white"
      style={{ paddingInline: `${paddingX}px`, paddingBlock: `${paddingY}px` }}
    >
      <div className="mx-auto w-full px-3 py-4 sm:px-4 md:px-6 md:py-6">
        <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
          <h2 className="text-xl font-bold text-blue-600 md:text-3xl" style={titleStyle}>
            {settings.title}
          </h2>
          {settings.showSeeMore && (
            <Link
              href={settings.seeMore.url || "#"}
              className="cursor-pointer rounded-sm bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-950 transition duration-500 hover:bg-amber-200"
            >
              {settings.seeMore.name}
            </Link>
          )}
        </div>

        <div className="relative w-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {canSlide && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-sm border border-[#eadfca] bg-amber-100 text-amber-950 transition duration-700 hover:bg-amber-200"
              aria-label="Previous template"
            >
              <Icon name="ArrowLeft" />
            </Button>
          )}

          <div className="overflow-hidden">
            <div
              className="flex items-stretch transition-transform duration-500 ease-in-out will-change-transform"
              style={{ transform: `translateX(-${safeCurrentIndex * (100 / visibleItems)}%)` }}
            >
              {settings.templates.map((template, index) => (
                <div
                  key={template.id}
                  className={cn("flex min-w-0 shrink-0 px-2 py-1")}
                  style={{ flexBasis: itemWidth, maxWidth: itemWidth }}
                >
                  <div className="flex h-full w-full min-w-0">
                    <RenderItem
                      item={template}
                      priority={index === 0}
                      loading={index < 4 ? "eager" : "lazy"}
                      settings={settings}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canSlide && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-sm border border-[#eadfca] bg-amber-100 text-amber-950 transition duration-700 hover:bg-amber-200"
              aria-label="Next template"
            >
              <Icon name="ArrowRight" />
            </Button>
          )}

          {shouldShowBottomNavigation && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => {
                const isActive = index === safeCurrentIndex;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2.5 cursor-pointer rounded-sm border border-[#eadfca] transition duration-700",
                      isActive ? "w-8 bg-amber-200" : "w-2.5 bg-white hover:bg-amber-100",
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QueryContainer2;
