/*
|-----------------------------------------
| setting up page.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 2 September, 2026
|-----------------------------------------
*/

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/all-icons/all-icons";
import { formatBDT } from "@/lib/cart";
import type { OrderStatus } from "@/lib/dashboard/orders";
import { saveOrderToHistory } from "@/lib/order-history";

type TrackingOrder = {
  id: string;
  status: OrderStatus;
  total: number;
  currency: "BDT";
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  customer: { name: string; phone: string; address: string };
  items: {
    productId: string;
    name: string;
    primaryImage: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};

const steps = ["Order", "Received Order", "Packing", "Shipment", "Delivery", "Cancel", "Delivered"];
const statusStep: Record<TrackingOrder["status"], number> = {
  incomplete: 0,
  placed: 1,
  confirmed: 2,
  processing: 3,
  completed: 6,
  cancelled: 5,
};

export default function OrderTrackingPage() {
  const id = useSearchParams().get("id")?.trim() ?? "";
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState("");
  const pageError = !id ? "An order ID is required." : error;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/orders/v1?id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { order?: TrackingOrder; error?: string } | null;
        if (!response.ok || !payload?.order) throw new Error(payload?.error ?? "Could not load this order.");
        return payload.order;
      })
      .then((nextOrder) => {
        if (cancelled) return;
        setOrder(nextOrder);
        saveOrderToHistory(nextOrder);
      })
      .catch(
        (reason: unknown) =>
          !cancelled && setError(reason instanceof Error ? reason.message : "Could not load this order."),
      );
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (pageError) return <TrackingState title="Order unavailable" detail={pageError} />;
  if (!order) return <TrackingState title="Loading order" detail="Getting the latest delivery information…" />;

  const isCancelled = order.status === "cancelled";
  const timelineSteps = isCancelled ? steps : steps.filter((step) => step !== "Cancel");
  const currentStep = isCancelled ? statusStep.cancelled : order.status === "completed" ? 5 : statusStep[order.status];
  const estimatedDate = estimatedDeliveryDate(order);
  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-950"
          href="/"
        >
          <Icon name="ArrowLeft" /> Continue shopping
        </Link>
        <section className="mt-5 rounded-sm border border-[#eadfca] bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-amber-700 uppercase">Order tracking</p>
              <h1 className="mt-2 text-2xl font-bold text-stone-950">Order {order.id}</h1>
              <p className="mt-1 text-sm text-stone-500">
                {order.status === "incomplete" ? "Started" : "Placed"} {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-bold capitalize ${isCancelled ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-950"}`}
            >
              {order.status}
            </span>
          </div>

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-[680px] items-start">
              {timelineSteps.map((step, index) => {
                const active = isCancelled ? index === 0 || index === currentStep : index <= currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div className="flex flex-1 items-start" key={step}>
                    <div className="flex w-full flex-col items-center text-center">
                      <span
                        className={`grid size-7 place-items-center rounded-full text-xs font-bold ${active ? "bg-amber-700 text-white" : "bg-stone-200 text-stone-500"}`}
                      >
                        {active ? <Icon name="Check" /> : index + 1}
                      </span>
                      <span className={`mt-2 text-xs font-semibold ${isCurrent ? "text-amber-900" : "text-stone-500"}`}>
                        {step}
                      </span>
                    </div>
                    {index < timelineSteps.length - 1 ? (
                      <span
                        className={`mt-3 h-0.5 flex-1 ${!isCancelled && index < currentStep ? "bg-amber-700" : "bg-stone-200"}`}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-5 rounded-sm bg-[#fffaf0] p-4 text-sm text-stone-700">
            <span className="font-bold text-stone-950">Estimated date: </span>
            {estimatedDate
              ? estimatedDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
              : order.status === "incomplete"
                ? "Pending placement"
                : "Cancelled order"}
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <section className="rounded-sm border border-[#eadfca] bg-white p-5 lg:col-span-2">
            <h2 className="font-bold text-stone-950">Order details</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <article
                  className="flex gap-3 border-b border-[#f1e8d9] pb-3 last:border-0 last:pb-0"
                  key={item.productId}
                >
                  <Image
                    alt={item.name}
                    className="size-16 rounded-sm object-cover"
                    height={64}
                    src={item.primaryImage}
                    unoptimized
                    width={64}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900">{item.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {item.quantity} × {formatBDT(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900">{formatBDT(item.lineTotal)}</span>
                </article>
              ))}
            </div>
          </section>
          <aside className="rounded-sm border border-[#eadfca] bg-white p-5 text-sm">
            <h2 className="font-bold text-stone-950">Delivery details</h2>
            <p className="mt-3 font-semibold text-stone-900">{order.customer.name}</p>
            <p className="mt-1 text-stone-600">{order.customer.phone || "Phone not provided"}</p>
            <p className="mt-1 text-stone-600">{order.customer.address || "Address not provided"}</p>
            <div className="mt-5 border-t border-[#eadfca] pt-4">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{order.itemCount}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-bold text-stone-950">
                <span>Total</span>
                <span>{formatBDT(order.total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function estimatedDeliveryDate(order: TrackingOrder) {
  if (order.status === "cancelled" || order.status === "incomplete") return null;
  if (order.status === "completed") return new Date(order.updatedAt);
  const days = order.status === "processing" ? 2 : order.status === "confirmed" ? 4 : 5;
  const date = new Date(order.createdAt);
  date.setDate(date.getDate() + days);
  return date;
}

function TrackingState({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf0] px-4">
      <div className="max-w-sm rounded-sm border border-[#eadfca] bg-white p-6 text-center shadow-sm">
        <h1 className="font-bold text-stone-950">{title}</h1>
        <p className="mt-2 text-sm text-stone-600">{detail}</p>
      </div>
    </main>
  );
}
