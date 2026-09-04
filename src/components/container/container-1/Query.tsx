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
  "1x3": "md:grid-cols-3",
};

const sortTemplates = (templates: TemplateItem[], sortMode: IContainerData["sortMode"]) => {
  if (sortMode === "custom") return templates;
  return [...templates].sort((a, b) => {
    const result = a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
    return sortMode === "ascending" ? result : -result;
  });
};

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
      seeMore: {
        ...defaultDataContainer1.seeMore,
        ...(parsedData.seeMore || {}),
        name: parsedData.seeMore?.name || parsedData.viewMoreText || defaultDataContainer1.seeMore.name,
      },
      templates: parsedData.templates?.length ? parsedData.templates : defaultDataContainer1.templates,
    };

    return {
      ...settings,
      templates: sortTemplates(settings.templates, settings.sortMode),
    };
  } catch {
    return defaultDataContainer1;
  }
};

const QueryContainer1 = ({ data }: ContainerProps) => {
  const settings = resolveData(data);
  const mobileGridClassName =
    mobileGridLayoutClasses[settings.mobileGridLayout] || mobileGridLayoutClasses[defaultDataContainer1.mobileGridLayout];
  const gridClassName = gridLayoutClasses[settings.gridLayout] || gridLayoutClasses[defaultDataContainer1.gridLayout];

  return (
    <section className="custom-parent-border w-full border-x-1 border-[#eadfca] bg-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-blue-600 md:text-3xl">{settings.title}</h2>
          {settings.showSeeMore && (
            <Link
              href={settings.seeMore.url || "#"}
              className="cursor-pointer rounded-sm bg-amber-100 text-sm font-semibold text-amber-950 transition duration-700 hover:bg-amber-200"
            >
              {settings.seeMore.name}
            </Link>
          )}
        </div>
        {/* Render Each card */}
        <div className="md:hidden block">
          <div className={`grid items-stretch gap-3 ${mobileGridClassName} ${gridClassName}`}>
            {settings.templates.map((template) => (
              <RenderItem key={template.id} item={template} settings={settings} />
            ))}
          </div>
        </div>
        <div className="hidden md:block">
          <div className="grid grid-cols-3 items-stretch gap-3 lg:grid-cols-4">
            {settings.templates.map((template) => (
              <RenderItem key={template.id} item={template} settings={settings} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QueryContainer1;
