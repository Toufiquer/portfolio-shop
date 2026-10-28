/*
|-----------------------------------------
| setting up dashboard academy tutorial library
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import { BookOpen, CirclePlay, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import type { TutorialItem } from "@/lib/dashboard/tutorials";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

type Lesson = {
  depth: number;
  id: string;
  index: number;
  route?: string;
  tag: string;
  title: string;
  ytUrl: string;
};

function flattenTutorials(items: TutorialItem[]) {
  const lessons: Lesson[] = [];

  function visit(entries: TutorialItem[], ancestors: string[] = [], inheritedRoute?: string) {
    for (const item of entries) {
      const index = lessons.length + 1;
      const titleParts = [...ancestors, item.tag];
      lessons.push({
        depth: ancestors.length,
        id: `tutorial-lesson-${index}`,
        index,
        route: item.sidebar_url ?? inheritedRoute,
        tag: item.tag,
        title: titleParts.join(" / "),
        ytUrl: item.yt_url,
      });
      if (item.children?.length) visit(item.children, titleParts, item.sidebar_url ?? inheritedRoute);
    }
  }

  visit(items);
  return lessons;
}

function lessonNumber(index: number) {
  return String(index).padStart(2, "0");
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TutorialLibrary({ tutorials }: { tutorials: TutorialItem[] }) {
  const lessons = useMemo(() => flattenTutorials(tutorials), [tutorials]);
  const [activeId, setActiveId] = useState<string | null>(() => lessons[0]?.id ?? null);
  const lessonElements = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (!lessons.length) return;
    let frame: number | null = null;
    const updateActiveLesson = () => {
      frame = null;
      const anchor = Math.min(window.innerHeight * 0.3, 240);
      const closest = lessons.reduce<Lesson | null>((candidate, lesson) => {
        const element = lessonElements.current.get(lesson.id);
        if (!element) return candidate;
        if (!candidate) return lesson;
        const candidateDistance = Math.abs(
          (lessonElements.current.get(candidate.id)?.getBoundingClientRect().top ?? 0) - anchor,
        );
        const distance = Math.abs(element.getBoundingClientRect().top - anchor);
        return distance < candidateDistance ? lesson : candidate;
      }, null);
      if (closest) setActiveId(closest.id);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateActiveLesson);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [lessons]);

  function selectLesson(id: string) {
    setActiveId(id);
    lessonElements.current.get(id)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const nextIndex =
      event.key === "ArrowDown"
        ? Math.min(index + 1, lessons.length - 1)
        : event.key === "ArrowUp"
          ? Math.max(index - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? lessons.length - 1
              : null;
    if (nextIndex === null) return;
    event.preventDefault();
    document.getElementById(`tutorial-topic-${lessons[nextIndex].id}`)?.focus();
  }

  if (!lessons.length)
    return (
      <main className="min-h-[calc(100vh-65px)] flex-1 bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-10">
        <section className="mx-auto max-w-7xl rounded-sm border border-dashed border-[#dfd2bb] bg-white p-8 text-center shadow-sm">
          <BookOpen aria-hidden="true" className="mx-auto h-8 w-8 text-amber-700" />
          <h1 className="mt-3 text-xl font-semibold text-stone-900">Tutorials are not available yet</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
            Add tutorial topics to help your team learn the dashboard workflows.
          </p>
        </section>
      </main>
    );

  const selectedLessonId = lessons.some((lesson) => lesson.id === activeId) ? activeId : (lessons[0]?.id ?? null);
  const activeLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];

  return (
    <main className="min-h-[calc(100vh-65px)] flex-1 bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="relative isolate overflow-hidden rounded-sm border border-[#eadfca] bg-white px-5 py-7 shadow-[0_18px_45px_-34px_rgba(120,53,15,.3)] sm:px-7 sm:py-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-14 -top-14 -z-10 h-44 w-44 rounded-full bg-amber-200/70 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-14 -z-10 h-44 w-44 rounded-full bg-emerald-100/80 blur-3xl"
          />
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 motion-reduce:animate-none">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-800">Dashboard academy</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Tutorial library</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Choose a topic or scroll through the guides. Your current lesson remains highlighted as you learn.
            </p>
            <span className="mt-5 inline-flex rounded-sm border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
              {lessons.length} video tutorials
            </span>
          </div>
        </header>

        <section aria-label="Tutorial lessons" className="mt-6 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <nav aria-label="Tutorial contents" className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-sm border border-[#eadfca] bg-white p-3 shadow-sm">
              <div className="border-b border-[#eadfca] px-2 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-800">Contents</p>
                <p className="mt-1 truncate text-sm font-semibold text-stone-900" title={activeLesson.title}>
                  {activeLesson.title}
                </p>
              </div>
              <ol className="mt-2 max-h-[min(54vh,34rem)] space-y-0.5 overflow-y-auto pr-1">
                {lessons.map((lesson, index) => {
                  const active = lesson.id === activeLesson.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        aria-current={active ? "page" : undefined}
                        aria-label={`Go to lesson ${lessonNumber(lesson.index)}: ${lesson.title}`}
                        className={`group relative flex w-full items-center gap-2 rounded-sm border-l-2 py-2 text-left text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${lesson.depth ? "pl-6 pr-2" : "px-2"} ${active ? "border-amber-600 bg-amber-50 font-medium text-amber-900" : "border-transparent text-stone-500 hover:bg-[#fffaf0] hover:text-stone-800"}`}
                        id={`tutorial-topic-${lesson.id}`}
                        onClick={() => selectLesson(lesson.id)}
                        onKeyDown={(event) => moveFocus(event, index)}
                        type="button"
                      >
                        <span className="w-5 shrink-0 text-[11px] font-medium tabular-nums text-stone-400">
                          {lessonNumber(lesson.index)}
                        </span>
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${active ? "bg-amber-600" : "bg-stone-300 opacity-0 transition-opacity group-hover:opacity-100"}`}
                        />
                        <span className="min-w-0 flex-1 truncate">{lesson.tag}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>

          <section aria-label="Tutorial video lessons" className="grid gap-4">
            {lessons.map((lesson) => (
              <TutorialLesson
                active={lesson.id === selectedLessonId}
                key={lesson.id}
                lesson={lesson}
                register={(element) => {
                  if (element) lessonElements.current.set(lesson.id, element);
                  else lessonElements.current.delete(lesson.id);
                }}
              />
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}

function TutorialLesson({
  active,
  lesson,
  register,
}: {
  active: boolean;
  lesson: Lesson;
  register: (element: HTMLElement | null) => void;
}) {
  const embedUrl = active ? getYouTubeEmbedUrl(lesson.ytUrl) : null;
  const headingId = `${lesson.id}-title`;

  return (
    <article
      aria-labelledby={headingId}
      className={`scroll-mt-24 rounded-sm border bg-white p-4 transition-shadow duration-300 sm:p-5 ${active ? "border-amber-300 shadow-[0_18px_40px_-32px_rgba(146,64,14,.58)]" : "border-[#eadfca] shadow-sm"}`}
      ref={register}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-800">
            Lesson {lessonNumber(lesson.index)}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl" id={headingId}>
            {lesson.title}
          </h2>
        </div>
        {lesson.route ? (
          <code
            className="max-w-full truncate rounded-sm border border-[#eadfca] bg-[#fffaf0] px-2 py-1 text-xs text-stone-600"
            title={lesson.route}
          >
            {lesson.route}
          </code>
        ) : null}
      </div>

      <div className="relative mt-4 aspect-video overflow-hidden rounded-sm border border-stone-800 bg-stone-900">
        {active && embedUrl ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={embedUrl}
            title={`${lesson.title} tutorial video`}
          />
        ) : active ? (
          <div className="grid h-full place-items-center p-6 text-center text-stone-200" role="status">
            <div>
              <CirclePlay aria-hidden="true" className="mx-auto h-8 w-8 text-amber-300" />
              <p className="mt-3 font-medium">This tutorial video is unavailable.</p>
              <p className="mt-1 text-sm text-stone-400">The active lesson does not have a valid YouTube URL yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-stone-200">
            <div>
              <Play aria-hidden="true" className="mx-auto h-7 w-7 text-amber-300" />
              <p className="mt-3 text-sm font-medium">Select or scroll to this lesson to load its video.</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
