/*
|-----------------------------------------
| setting up Query.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

"use client";

import Link from "next/link";

import { ContainerProps, defaultDataContainer1, IContainerData, TemplateItem } from "./data";
import RenderItem from "./RenderItem";

const mobileGridLayoutClasses: Record<IContainerData["mobileGridLayout"], string> = {
  "1x1": "grid-cols-1",
  "1x2": "grid-cols-2",
};

const gridLayoutClasses: Record<IContainerData["gridLayout"], string> = {
  "1x1": "md:grid-cols-1",
  "1x2": "md:grid-cols-2",
  "1x3": "md:grid-cols-3 lg:grid-cols-4",
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
    typeof template.image === "string" && template.image ? template.image : defaultDataContainer1.templates[0].image,
  url: typeof template.url === "string" ? template.url : "",
  visible: template.visible ?? true,
});

const resolveData = (data?: IContainerData | string): IContainerData => {
  if (!data) return defaultDataContainer1;

  try {
    const parsedData = typeof data === "string" ? (JSON.parse(data) as Partial<IContainerData>) : data;
    const settings = {
      ...defaultDataContainer1,
      ...parsedData,
      title: parsedData.title || parsedData.sectionTitle || defaultDataContainer1.title,
      sortMode: parsedData.sortMode || defaultDataContainer1.sortMode,
      gridLayout: parsedData.gridLayout || defaultDataContainer1.gridLayout,
      mobileGridLayout: parsedData.mobileGridLayout || defaultDataContainer1.mobileGridLayout,
      showSeeMore: parsedData.showSeeMore ?? defaultDataContainer1.showSeeMore,
      paddingX: String(Math.max(-300, Math.min(300, Number(parsedData.paddingX ?? defaultDataContainer1.paddingX) || 0))),
      paddingY: String(Math.max(-300, Math.min(300, Number(parsedData.paddingY ?? defaultDataContainer1.paddingY) || 0))),
      titleFontFamily: parsedData.titleFontFamily || defaultDataContainer1.titleFontFamily,
      titleFontSize: parsedData.titleFontSize || defaultDataContainer1.titleFontSize,
      titleFontColor: parsedData.titleFontColor || defaultDataContainer1.titleFontColor,
      titleFontWeight: parsedData.titleFontWeight || defaultDataContainer1.titleFontWeight,
      seeMore: {
        ...defaultDataContainer1.seeMore,
        ...(parsedData.seeMore || {}),
        name: parsedData.seeMore?.name || parsedData.viewMoreText || defaultDataContainer1.seeMore.name,
      },
      templates: (parsedData.templates?.length ? parsedData.templates : defaultDataContainer1.templates).map(
        normalizeTemplate,
      ),
    };

    return {
      ...settings,
      templates: sortTemplates(settings.templates, settings.sortMode).filter((template) => template.visible),
    };
  } catch {
    return defaultDataContainer1;
  }
};

const QueryContainer1 = ({ data }: ContainerProps) => {
  const settings = resolveData(data);
  const paddingX = Math.max(0, Number(settings.paddingX) || 0);
  const paddingY = Math.max(0, Number(settings.paddingY) || 0);

  const titleStyle: React.CSSProperties = {
    fontFamily: settings.titleFontFamily && settings.titleFontFamily !== "inherit" ? settings.titleFontFamily : undefined,
    fontSize: settings.titleFontSize ? `${settings.titleFontSize}px` : undefined,
    color: settings.titleFontColor || undefined,
    fontWeight: settings.titleFontWeight || undefined,
  };

  const mobileGridClassName =
    mobileGridLayoutClasses[settings.mobileGridLayout] ||
    mobileGridLayoutClasses[defaultDataContainer1.mobileGridLayout];
  const gridClassName = gridLayoutClasses[settings.gridLayout] || gridLayoutClasses[defaultDataContainer1.gridLayout];

  return (
    <section
      className="custom-parent-border md:max-w-7xl w-full bg-white"
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
        {/* Render Each card in a unified responsive grid */}
        <div className={`grid items-stretch gap-3 sm:gap-4 ${mobileGridClassName} ${gridClassName}`}>
          {settings.templates.map((template, index) => (
            <RenderItem
              key={template.id}
              item={template}
              priority={index === 0}
              loading={index < 4 ? "eager" : "lazy"}
              settings={settings}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QueryContainer1;
