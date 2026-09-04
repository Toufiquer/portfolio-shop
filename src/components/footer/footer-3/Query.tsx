/*
|-----------------------------------------
| setting up Query.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 16 August 2026
|-----------------------------------------
*/
"use client";
import Image from "next/image";

import type { FooterThreeData, FooterThreeLink } from "./data";
const Links = ({ links }: { links: FooterThreeLink[] }) => (
  <div className="mt-4 grid gap-2 text-sm">
    {links
      .filter((link) => link.visible)
      .map((link) => (
        <a className="w-fit transition duration-700 hover:translate-x-1" href={link.url} key={link.id}>
          {link.label}
        </a>
      ))}
  </div>
);
export default function Query({ data }: { data: FooterThreeData }) {
  if (!data.isVisible) return null;
  return (
    <footer className="custom-parent-border" style={{ background: data.background, color: data.foreground }}>
      <div className="mx-auto grid max-w-7xl px-4 md:px-6 gap-8 py-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.1fr]">
        <div>
          {data.showLogo && data.logoUrl && (
            <div className="relative h-12 w-40 max-w-full overflow-hidden">
              <Image
                alt={data.logoAlt}
                className="object-contain object-left"
                fill
                sizes="160px"
                src={data.logoUrl}
                unoptimized
              />
            </div>
          )}
          <h2 className="mt-6 text-xl font-bold">{data.brand}</h2>
          <p className="mt-4 max-w-xs text-sm leading-6 opacity-80">{data.description}</p>
        </div>
        <div>
          <h2 className="font-bold">Destinations</h2>
          <Links links={data.destinations} />
        </div>
        <div>
          <h2 className="font-bold">Services</h2>
          <Links links={data.services} />
        </div>
        <div>
          <h2 className="font-bold">Contact</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <a href={`mailto:${data.email}`}>{data.email}</a>
            <a href={`tel:${data.phone.replace(/[^+\d]/g, "")}`}>{data.phone}</a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-[#fffaf0] py-3 text-xs text-stone-600">
        <div className="mx-auto flex px-4 md:px-6 max-w-7xl flex-wrap items-center justify-between gap-4">
          <span>{data.copyright}</span>
          <div className="flex flex-wrap gap-6">
            {data.legalLinks
              .filter((link) => link.visible)
              .map((link) => (
                <a className="hover:text-red-300" href={link.url} key={link.id}>
                  {link.label}
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
