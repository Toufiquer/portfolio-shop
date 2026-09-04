/*
|-----------------------------------------
| setting up SectionIndex.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 19 August, 2026
|-----------------------------------------
*/

import type { ComponentType } from "react";

import { defaultDataSection1 as one } from "./section-1/data";
import M1 from "./section-1/Mutation";
import Q1 from "./section-1/Query";
import { defaultDataSection10 as ten } from "./section-10/data";
import M10 from "./section-10/Mutation";
import Q10 from "./section-10/Query";
import { defaultDataSection11 as eleven } from "./section-11/data";
import M11 from "./section-11/Mutation";
import Q11 from "./section-11/Query";
import { defaultDataSection12 as twelve } from "./section-12/data";
import M12 from "./section-12/Mutation";
import Q12 from "./section-12/Query";
import { defaultDataSection13 as thirteen } from "./section-13/data";
import M13 from "./section-13/Mutation";
import Q13 from "./section-13/Query";
import { defaultDataSection14 as fourteen } from "./section-14/data";
import M14 from "./section-14/Mutation";
import Q14 from "./section-14/Query";
import { defaultDataSection15 as fifteen } from "./section-15/data";
import M15 from "./section-15/Mutation";
import Q15 from "./section-15/Query";
import { defaultDataSection16 as sixteen } from "./section-16/data";
import M16 from "./section-16/Mutation";
import Q16 from "./section-16/Query";
import { defaultDataSection17 as seventeen } from "./section-17/data";
import M17 from "./section-17/Mutation";
import Q17 from "./section-17/Query";
import { defaultDataSection18 as eighteen } from "./section-18/data";
import M18 from "./section-18/Mutation";
import Q18 from "./section-18/Query";
import { defaultDataSection19 as nineteen } from "./section-19/data";
import M19 from "./section-19/Mutation";
import Q19 from "./section-19/Query";
import { defaultDataSection2 as two } from "./section-2/data";
import M2 from "./section-2/Mutation";
import Q2 from "./section-2/Query";
import { defaultDataSection20 as twenty } from "./section-20/data";
import M20 from "./section-20/Mutation";
import Q20 from "./section-20/Query";
import { defaultDataSection21 as twentyOne } from "./section-21/data";
import M21 from "./section-21/Mutation";
import Q21 from "./section-21/Query";
import { defaultDataSection22 as twentyTwo } from "./section-22/data";
import M22 from "./section-22/Mutation";
import Q22 from "./section-22/Query";
import { defaultDataSection23 as twentyThree } from "./section-23/data";
import M23 from "./section-23/Mutation";
import Q23 from "./section-23/Query";
import { defaultData as twentyFour } from "./section-24/data";
import M24 from "./section-24/Mutation";
import Q24 from "./section-24/Query";
import { defaultDataSection25 as twentyFive } from "./section-25/data";
import M25 from "./section-25/Mutation";
import Q25 from "./section-25/Query";
import { defaultDataSection26 as twentySix } from "./section-26/data";
import M26 from "./section-26/Mutation";
import Q26 from "./section-26/Query";
import { defaultDataSection27 as twentySeven } from "./section-27/data";
import M27 from "./section-27/Mutation";
import Q27 from "./section-27/Query";
import { defaultDataSection28 as twentyEight } from "./section-28/data";
import M28 from "./section-28/Mutation";
import Q28 from "./section-28/Query";
import { defaultDataSection29 as twentyNine } from "./section-29/data";
import M29 from "./section-29/Mutation";
import Q29 from "./section-29/Query";
import { defaultDataSection3 as three } from "./section-3/data";
import M3 from "./section-3/Mutation";
import Q3 from "./section-3/Query";
import { defaultDataSection30 as thirty } from "./section-30/data";
import M30 from "./section-30/Mutation";
import Q30 from "./section-30/Query";
import { defaultDataSection31 as thirtyOne } from "./section-31/data";
import M31 from "./section-31/Mutation";
import Q31 from "./section-31/Query";
import { defaultDataSection32 as thirtyTwo } from "./section-32/data";
import M32 from "./section-32/Mutation";
import Q32 from "./section-32/Query";
import { defaultDataSection33 as thirtyThree } from "./section-33/data";
import M33 from "./section-33/Mutation";
import Q33 from "./section-33/Query";
import { defaultDataSection34 as thirtyFour } from "./section-34/data";
import M34 from "./section-34/Mutation";
import Q34 from "./section-34/Query";
import { defaultDataSection35 as thirtyFive } from "./section-35/data";
import M35 from "./section-35/Mutation";
import Q35 from "./section-35/Query";
import { defaultDataSection36 as thirtySix } from "./section-36/data";
import M36 from "./section-36/Mutation";
import Q36 from "./section-36/Query";
import { defaultDataSection37 as thirtySeven } from "./section-37/data";
import M37 from "./section-37/Mutation";
import Q37 from "./section-37/Query";
import { defaultDataSection38 as thirtyEight } from "./section-38/data";
import M38 from "./section-38/Mutation";
import Q38 from "./section-38/Query";
import { defaultDataSection39 as thirtyNine } from "./section-39/data";
import M39 from "./section-39/Mutation";
import Q39 from "./section-39/Query";
import { defaultDataSection4 as four } from "./section-4/data";
import M4 from "./section-4/Mutation";
import Q4 from "./section-4/Query";
import { defaultDataSection40 as forty } from "./section-40/data";
import M40 from "./section-40/Mutation";
import Q40 from "./section-40/Query";
import { defaultDataSection41 as fortyOne } from "./section-41/data";
import M41 from "./section-41/Mutation";
import Q41 from "./section-41/Query";
import { defaultDataSection42 as fortyTwo } from "./section-42/data";
import M42 from "./section-42/Mutation";
import Q42 from "./section-42/Query";
import { defaultDataSection43 as fortyThree } from "./section-43/data";
import M43 from "./section-43/Mutation";
import Q43 from "./section-43/Query";
import { defaultDataSection44 as fortyFour } from "./section-44/data";
import M44 from "./section-44/Mutation";
import Q44 from "./section-44/Query";
import { defaultDataSection45 as fortyFive } from "./section-45/data";
import M45 from "./section-45/Mutation";
import Q45 from "./section-45/Query";
import { defaultDataSection46 as fortySix } from "./section-46/data";
import M46 from "./section-46/Mutation";
import Q46 from "./section-46/Query";
import { defaultDataSection47 as fortySeven } from "./section-47/data";
import M47 from "./section-47/Mutation";
import Q47 from "./section-47/Query";
import { defaultDataSection48 as fortyEight } from "./section-48/data";
import M48 from "./section-48/Mutation";
import Q48 from "./section-48/Query";
import { defaultDataSection5 as five } from "./section-5/data";
import M5 from "./section-5/Mutation";
import Q5 from "./section-5/Query";
import { defaultDataSection6 as six } from "./section-6/data";
import M6 from "./section-6/Mutation";
import Q6 from "./section-6/Query";
import { defaultDataSection7 as seven } from "./section-7/data";
import M7 from "./section-7/Mutation";
import Q7 from "./section-7/Query";
import { defaultDataSection8 as eight } from "./section-8/data";
import M8 from "./section-8/Mutation";
import Q8 from "./section-8/Query";
import { defaultDataSection9 as nine } from "./section-9/data";
import M9 from "./section-9/Mutation";
import Q9 from "./section-9/Query";

export type SectionVariant =
  | "section-1"
  | "section-2"
  | "section-3"
  | "section-4"
  | "section-5"
  | "section-6"
  | "section-7"
  | "section-8"
  | "section-9"
  | "section-10"
  | "section-11"
  | "section-12"
  | "section-13"
  | "section-14"
  | "section-15"
  | "section-16"
  | "section-17"
  | "section-18"
  | "section-19"
  | "section-20"
  | "section-21"
  | "section-22"
  | "section-23"
  | "section-24"
  | "section-25"
  | "section-26"
  | "section-27"
  | "section-28"
  | "section-29"
  | "section-30"
  | "section-31"
  | "section-32"
  | "section-33"
  | "section-34"
  | "section-35"
  | "section-36"
  | "section-37"
  | "section-38"
  | "section-39"
  | "section-40"
  | "section-41"
  | "section-42"
  | "section-43"
  | "section-44"
  | "section-45"
  | "section-46"
  | "section-47"
  | "section-48";
export type SectionData = Record<string, string>;
type Definition = {
  defaultData: SectionData;
  title: string;
  description: string;
  Mutation: ComponentType<{ data?: SectionData; onChange: (data: SectionData) => void }>;
  Query: ComponentType<{ data?: SectionData }>;
};

export const sectionIndex: Record<SectionVariant, Definition> = {
  "section-1": {
    defaultData: one,
    title: "Rich text section",
    description: "Write formatted content and insert media-library images",
    Mutation: M1 as unknown as Definition["Mutation"],
    Query: Q1 as unknown as Definition["Query"],
  },
  "section-2": {
    defaultData: two,
    title: "Dark content section",
    description: "A contrasting content section",
    Mutation: M2 as unknown as Definition["Mutation"],
    Query: Q2 as unknown as Definition["Query"],
  },
  "section-3": {
    defaultData: three,
    title: "Amber content section",
    description: "A clear, focused content section",
    Mutation: M3 as unknown as Definition["Mutation"],
    Query: Q3 as unknown as Definition["Query"],
  },
  "section-4": {
    defaultData: four as unknown as SectionData,
    title: "Network dashboard section",
    description: "Metrics and moderation queue",
    Mutation: M4 as unknown as Definition["Mutation"],
    Query: Q4 as unknown as Definition["Query"],
  },
  "section-5": {
    defaultData: five as unknown as SectionData,
    title: "Editorial blog section",
    description: "Featured posts with categories and authors",
    Mutation: M5 as unknown as Definition["Mutation"],
    Query: Q5 as unknown as Definition["Query"],
  },
  "section-6": {
    defaultData: six as unknown as SectionData,
    title: "University profile section",
    description: "Institution details, programs, stats, and admission CTA",
    Mutation: M6 as unknown as Definition["Mutation"],
    Query: Q6 as unknown as Definition["Query"],
  },
  "section-7": {
    defaultData: seven as unknown as SectionData,
    title: "Study destinations section",
    description: "Filterable universities, courses, and application links by city",
    Mutation: M7 as unknown as Definition["Mutation"],
    Query: Q7 as unknown as Definition["Query"],
  },
  "section-8": {
    defaultData: eight as unknown as SectionData,
    title: "Call-to-action section",
    description: "A focused closing message and action button",
    Mutation: M8 as unknown as Definition["Mutation"],
    Query: Q8 as unknown as Definition["Query"],
  },
  "section-9": {
    defaultData: nine as unknown as SectionData,
    title: "Success stories intro",
    description: "A focused introduction for testimonials and success stories",
    Mutation: M9 as unknown as Definition["Mutation"],
    Query: Q9 as unknown as Definition["Query"],
  },
  "section-10": {
    defaultData: ten as unknown as SectionData,
    title: "Student success stories",
    description: "A vertical reel of university success stories",
    Mutation: M10 as unknown as Definition["Mutation"],
    Query: Q10 as unknown as Definition["Query"],
  },
  "section-11": {
    defaultData: eleven as unknown as SectionData,
    title: "Professional journey section",
    description: "An animated timeline of experience and achievements",
    Mutation: M11 as unknown as Definition["Mutation"],
    Query: Q11 as unknown as Definition["Query"],
  },
  "section-12": {
    defaultData: twelve as unknown as SectionData,
    title: "Partnership network section",
    description: "Partners and collaboration options",
    Mutation: M12 as unknown as Definition["Mutation"],
    Query: Q12 as unknown as Definition["Query"],
  },
  "section-13": {
    defaultData: thirteen as unknown as SectionData,
    title: "Community events section",
    description: "Upcoming events with categories and registration actions",
    Mutation: M13 as unknown as Definition["Mutation"],
    Query: Q13 as unknown as Definition["Query"],
  },
  "section-14": {
    defaultData: fourteen as unknown as SectionData,
    title: "Latest articles section",
    description: "Editable articles with rich content blocks and authors",
    Mutation: M14 as unknown as Definition["Mutation"],
    Query: Q14 as unknown as Definition["Query"],
  },
  "section-15": {
    defaultData: fifteen as unknown as SectionData,
    title: "Office locations section",
    description: "Interactive locations, contact details, and map view",
    Mutation: M15 as unknown as Definition["Mutation"],
    Query: Q15 as unknown as Definition["Query"],
  },
  "section-16": {
    defaultData: sixteen as unknown as SectionData,
    title: "Action button section",
    description: "A configurable button with icon, path, and tab behavior",
    Mutation: M16 as unknown as Definition["Mutation"],
    Query: Q16 as unknown as Definition["Query"],
  },
  "section-17": {
    defaultData: seventeen as unknown as SectionData,
    title: "Styled action button section",
    description: "Configurable button with layout, size, icon, and appearance controls",
    Mutation: M17 as unknown as Definition["Mutation"],
    Query: Q17 as unknown as Definition["Query"],
  },
  "section-18": {
    defaultData: eighteen as unknown as SectionData,
    title: "Responsive image slider section",
    description: "Configurable slides with autoplay, navigation, and responsive layout settings",
    Mutation: M18 as unknown as Definition["Mutation"],
    Query: Q18 as unknown as Definition["Query"],
  },
  "section-19": {
    defaultData: nineteen as unknown as SectionData,
    title: "Topic tag slider section",
    description: "Configurable topic tags with autoplay, navigation, and visual style controls",
    Mutation: M19 as unknown as Definition["Mutation"],
    Query: Q19 as unknown as Definition["Query"],
  },
  "section-20": {
    defaultData: twenty as unknown as SectionData,
    title: "Image gallery section",
    description: "Responsive gallery layouts with captions, effects, and image management",
    Mutation: M20 as unknown as Definition["Mutation"],
    Query: Q20 as unknown as Definition["Query"],
  },
  "section-21": {
    defaultData: twentyOne as unknown as SectionData,
    title: "Spacer block section",
    description: "Configurable spacing, width, background, and display layout",
    Mutation: M21 as unknown as Definition["Mutation"],
    Query: Q21 as unknown as Definition["Query"],
  },
  "section-22": {
    defaultData: twentyTwo as unknown as SectionData,
    title: "Spacer block section",
    description: "Configurable spacing, width, background, and display layout",
    Mutation: M22 as unknown as Definition["Mutation"],
    Query: Q22 as unknown as Definition["Query"],
  },
  "section-23": {
    defaultData: twentyThree as unknown as SectionData,
    title: "Feature cards section",
    description: "Responsive feature cards with configurable icons, descriptions, and gradient themes",
    Mutation: M23 as unknown as Definition["Mutation"],
    Query: Q23 as unknown as Definition["Query"],
  },
  "section-24": {
    defaultData: twentyFour as unknown as SectionData,
    title: "Test benefits section",
    description: "Feature highlights, call-to-action, and performance statistics",
    Mutation: M24 as unknown as Definition["Mutation"],
    Query: Q24 as unknown as Definition["Query"],
  },
  "section-25": {
    defaultData: twentyFive as unknown as SectionData,
    title: "Practice features section",
    description: "Feature cards highlighting practice benefits and learning tools",
    Mutation: M25 as unknown as Definition["Mutation"],
    Query: Q25 as unknown as Definition["Query"],
  },
  "section-26": {
    defaultData: twentySix as unknown as SectionData,
    title: "Success statistics banner",
    description: "Community headline, metrics, and call-to-action banner",
    Mutation: M26 as unknown as Definition["Mutation"],
    Query: Q26 as unknown as Definition["Query"],
  },
  "section-27": {
    defaultData: twentySeven as unknown as SectionData,
    title: "IELTS course plans section",
    description: "Course pricing cards with levels, features, schedules, and enrollment actions",
    Mutation: M27 as unknown as Definition["Mutation"],
    Query: Q27 as unknown as Definition["Query"],
  },
  "section-28": {
    defaultData: twentyEight as unknown as SectionData,
    title: "Class benefits section",
    description: "Why choose our classes feature grid with configurable highlights",
    Mutation: M28 as unknown as Definition["Mutation"],
    Query: Q28 as unknown as Definition["Query"],
  },
  "section-29": {
    defaultData: twentyNine as unknown as SectionData,
    title: "IELTS consultation CTA section",
    description: "Call-to-action banner with consultation, demo, and contact details",
    Mutation: M29 as unknown as Definition["Mutation"],
    Query: Q29 as unknown as Definition["Query"],
  },
  "section-30": {
    defaultData: thirty as unknown as SectionData,
    title: "Study abroad services section",
    description: "Service highlights with guidance CTA and destination illustration",
    Mutation: M30 as unknown as Definition["Mutation"],
    Query: Q30 as unknown as Definition["Query"],
  },
  "section-31": {
    defaultData: thirtyOne as unknown as SectionData,
    title: "Study abroad impact section",
    description: "Headline, highlighted message, and placement statistics",
    Mutation: M31 as unknown as Definition["Mutation"],
    Query: Q31 as unknown as Definition["Query"],
  },
  "section-32": {
    defaultData: thirtyTwo as unknown as SectionData,
    title: "Success story timeline section",
    description: "Animated student journeys with responsive timeline storytelling",
    Mutation: M32 as unknown as Definition["Mutation"],
    Query: Q32 as unknown as Definition["Query"],
  },
  "section-33": {
    defaultData: thirtyThree as unknown as SectionData,
    title: "Premium templates hero section",
    description: "Blue hero banner with stats and feature chips",
    Mutation: M33 as unknown as Definition["Mutation"],
    Query: Q33 as unknown as Definition["Query"],
  },
  "section-34": {
    defaultData: thirtyFour as unknown as SectionData,
    title: "Creator video reviews section",
    description: "Responsive video review cards with configurable labels, links, and colors",
    Mutation: M34 as unknown as Definition["Mutation"],
    Query: Q34 as unknown as Definition["Query"],
  },
  "section-35": {
    defaultData: thirtyFive as unknown as SectionData,
    title: "Hostinger recommendation banner",
    description: "Configurable gradient recommendation banner with link and editable colors",
    Mutation: M35 as unknown as Definition["Mutation"],
    Query: Q35 as unknown as Definition["Query"],
  },
  "section-36": {
    defaultData: thirtySix as unknown as SectionData,
    title: "Category slider section",
    description: "Responsive category cards with editable icons, colors, and horizontal scrolling",
    Mutation: M36 as unknown as Definition["Mutation"],
    Query: Q36 as unknown as Definition["Query"],
  },
  "section-37": {
    defaultData: thirtySeven as unknown as SectionData,
    title: "Study abroad experience hero",
    description: "Animated bilingual hero with experience badge, calls to action, and theme colors",
    Mutation: M37 as unknown as Definition["Mutation"],
    Query: Q37 as unknown as Definition["Query"],
  },
  "section-38": {
    defaultData: thirtyEight as unknown as SectionData,
    title: "Mission and vision section",
    description: "Animated mission and vision collage with editable content, media, and colors",
    Mutation: M38 as unknown as Definition["Mutation"],
    Query: Q38 as unknown as Definition["Query"],
  },
  "section-39": {
    defaultData: thirtyNine as unknown as SectionData,
    title: "Study abroad guidance section",
    description: "Image collage and guidance copy with editable content, media, and theme colors",
    Mutation: M39 as unknown as Definition["Mutation"],
    Query: Q39 as unknown as Definition["Query"],
  },
  "section-40": {
    defaultData: forty as unknown as SectionData,
    title: "Free consultation section",
    description: "Appointment-focused study abroad content with editable actions, media, and colors",
    Mutation: M40 as unknown as Definition["Mutation"],
    Query: Q40 as unknown as Definition["Query"],
  },
  "section-41": {
    defaultData: fortyOne as unknown as SectionData,
    title: "Study destination information section",
    description: "Educational destination copy with editable paragraphs, image, and colors",
    Mutation: M41 as unknown as Definition["Mutation"],
    Query: Q41 as unknown as Definition["Query"],
  },
  "section-42": {
    defaultData: fortyTwo as unknown as SectionData,
    title: "United Kingdom study destination section",
    description: "Study destination copy with editable paragraphs, image, and colors",
    Mutation: M42 as unknown as Definition["Mutation"],
    Query: Q42 as unknown as Definition["Query"],
  },
  "section-43": {
    defaultData: fortyThree as unknown as SectionData,
    title: "United Kingdom benefits section",
    description: "Study destination benefits with editable content, image, and theme colors",
    Mutation: M43 as unknown as Definition["Mutation"],
    Query: Q43 as unknown as Definition["Query"],
  },
  "section-44": {
    defaultData: fortyFour as unknown as SectionData,
    title: "United Kingdom student visa section",
    description: "Visa requirements content with editable checklist items, image, and colors",
    Mutation: M44 as unknown as Definition["Mutation"],
    Query: Q44 as unknown as Definition["Query"],
  },
  "section-45": {
    defaultData: fortyFive as unknown as SectionData,
    title: "United Kingdom visa documents section",
    description: "Visa document checklist with editable content, image, and colors",
    Mutation: M45 as unknown as Definition["Mutation"],
    Query: Q45 as unknown as Definition["Query"],
  },
  "section-46": {
    defaultData: fortySix as unknown as SectionData,
    title: "Partner universities section",
    description: "University cards with editable institutions, media, application links, and colors",
    Mutation: M46 as unknown as Definition["Mutation"],
    Query: Q46 as unknown as Definition["Query"],
  },
  "section-47": {
    defaultData: fortySeven as unknown as SectionData,
    title: "United States study destination section",
    description: "Study destination copy with editable paragraphs, image, and colors",
    Mutation: M47 as unknown as Definition["Mutation"],
    Query: Q47 as unknown as Definition["Query"],
  },
  "section-48": {
    defaultData: fortyEight as unknown as SectionData,
    title: "Global consultation hero",
    description: "Animated globe hero with Bengali messaging, trust stamp, and consultation form",
    Mutation: M48 as unknown as Definition["Mutation"],
    Query: Q48 as unknown as Definition["Query"],
  },
};
export const sectionAssets = Object.entries(sectionIndex).map(([variant, section]) => ({
  variant: variant as SectionVariant,
  ...section,
}));
export const getSectionDefinition = (variant: string) => sectionIndex[variant as SectionVariant];
export const hydrateSectionData = (variant: string, data: Record<string, unknown>): SectionData | null => {
  const definition = getSectionDefinition(variant);
  return definition ? ({ ...definition.defaultData, ...data } as SectionData) : null;
};
export const sectionChoices = sectionAssets.map(({ variant, title, description }) => ({
  variant,
  label: `${title} · ${description}`,
}));
export const sectionDefaults = (kind: SectionVariant) => ({ ...sectionIndex[kind].defaultData });

export function SectionPreview({ kind, data }: { kind: SectionVariant; data: SectionData }) {
  const Query = getSectionDefinition(kind)?.Query;
  return Query ? <Query data={hydrateSectionData(kind, data) ?? data} /> : null;
}

export function SectionMutation({
  kind,
  data,
  onChange,
}: {
  kind: SectionVariant;
  data: SectionData;
  onChange: (data: SectionData) => void;
}) {
  const Mutation = getSectionDefinition(kind)?.Mutation;
  return Mutation ? <Mutation data={hydrateSectionData(kind, data) ?? data} onChange={onChange} /> : null;
}
