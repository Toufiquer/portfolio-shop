/*
|-----------------------------------------
| setting up ProductShowcase preview for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import Image from "next/image";
import Link from "next/link";

export default function ProductShowcase() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 p-4 md:grid-cols-2 md:p-8">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-stone-200 bg-white">
        <Image
          alt="NexaMart"
          className="object-contain p-12"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          src="/Logo.png"
        />
      </div>
      <div className="flex flex-col justify-center gap-5 rounded-sm border border-stone-200 bg-white p-6">
        <p className="text-sm font-semibold text-amber-800">NexaMart</p>
        <h2 className="text-2xl font-bold text-stone-900">Product details</h2>
        <p className="text-stone-600">View available product information in the NexaMart catalog.</p>
        <Link className="inline-flex w-fit rounded-sm bg-amber-700 px-5 py-3 font-semibold text-white" href="/products">
          Browse products
        </Link>
      </div>
    </section>
  );
}
