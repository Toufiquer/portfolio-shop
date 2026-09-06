/*
|-----------------------------------------
| setting up CartDrawer.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 September, 2026
|-----------------------------------------
*/

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/all-icons/all-icons";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CART_DRAWER_OPEN_EVENT,
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  clearCart,
  formatBDT,
  readCart,
  removeFromCart,
  type CartItem,
  updateCartQuantity,
} from "@/lib/cart";
import { validatePhoneNumber } from "@/lib/dashboard/orders";
import {
  ORDER_HISTORY_STORAGE_KEY,
  ORDER_HISTORY_UPDATED_EVENT,
  clearOrderHistory,
  readOrderHistory,
  removeOrderFromHistory,
  saveOrderToHistory,
  type LocalOrderHistoryItem,
} from "@/lib/order-history";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const openFrame = useRef<number | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"cart" | "history">("cart");
  const [history, setHistory] = useState<LocalOrderHistoryItem[]>([]);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [address, setAddress] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [orderToDelete, setOrderToDelete] = useState<LocalOrderHistoryItem | "all" | null>(null);

  const openCart = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setActiveTab("cart");
    setVisible(true);
    if (openFrame.current) window.cancelAnimationFrame(openFrame.current);
    openFrame.current = window.requestAnimationFrame(() => {
      openFrame.current = null;
      setOpen(true);
    });
  };

  const closeCart = () => {
    if (openFrame.current) {
      window.cancelAnimationFrame(openFrame.current);
      openFrame.current = null;
    }
    setCheckoutStatus("idle");
    setMessage("");
    setConfirmedOrderId(null);
    setOrderToDelete(null);
    setOpen(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setVisible(false), 300);
  };

  useEffect(() => {
    const sync = () => setItems(readCart());
    const syncHistory = () => setHistory(readOrderHistory());
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) sync();
      if (event.key === ORDER_HISTORY_STORAGE_KEY) syncHistory();
    };
    const onOpen = () => {
      sync();
      openCart();
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeCart();
    sync();
    syncHistory();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener(ORDER_HISTORY_UPDATED_EVENT, syncHistory);
    window.addEventListener("storage", onStorage);
    window.addEventListener(CART_DRAWER_OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener(ORDER_HISTORY_UPDATED_EVENT, syncHistory);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CART_DRAWER_OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []); // Event listeners are registered once; cart handlers only use stable state setters and refs.

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      if (openFrame.current) window.cancelAnimationFrame(openFrame.current);
    };
  }, []);

  useEffect(() => {
    if (!cooldownExpiresAt) return;
    const sync = () => {
      const remaining = Math.max(0, Math.ceil((new Date(cooldownExpiresAt).getTime() - Date.now()) / 1000));
      setCountdownSeconds(remaining);
      if (!remaining) setCooldownExpiresAt(null);
    };
    sync();
    const timer = window.setInterval(sync, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownExpiresAt]);

  const phoneValidation = validatePhoneNumber(phone);
  const checkoutDisabled =
    checkoutStatus === "processing" || countdownSeconds > 0 || !items.length || !phoneValidation.isValid;

  const handleCheckout = async () => {
    setPhoneTouched(true);
    if (!phoneValidation.isValid) {
      setCheckoutStatus("error");
      setMessage(phoneValidation.error || "Please enter a valid phone number.");
      return;
    }
    if (checkoutDisabled) return;
    setCheckoutStatus("processing");
    setConfirmedOrderId(null);
    setMessage("");
    try {
      const response = await fetch("/api/orders/v1", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          customer: { phone: phone.trim(), address: address.trim() },
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        error?: string;
        cooldownExpiresAt?: string;
        order?: LocalOrderHistoryItem;
      } | null;
      if (!response.ok || !payload?.ok) {
        if (payload?.code === "ORDER_LIMITED" && payload.cooldownExpiresAt)
          setCooldownExpiresAt(payload.cooldownExpiresAt);
        setCheckoutStatus("error");
        setMessage(payload?.error ?? "Could not place your order. Please try again.");
        return;
      }
      if (!payload.order?.id) throw new Error("The order confirmation was incomplete.");
      saveOrderToHistory(payload.order);
      clearCart();
      setConfirmedOrderId(payload.order.id);
      setCheckoutStatus("success");
      setMessage(`Order ${payload.order.id} was placed successfully.`);
    } catch {
      setCheckoutStatus("error");
      setMessage("Could not place your order. Check your connection and try again.");
    }
  };

  if (!visible) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ease-out motion-reduce:transition-none ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      role="presentation"
    >
      <button
        aria-label="Close cart"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
        onClick={closeCart}
        type="button"
      />
      <aside
        aria-label="Shopping cart"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-dvh w-[100vw] max-w-md flex-col border-l border-[#eadfca] bg-[#fffdf8] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
      >
        {checkoutStatus !== "idle" && message ? (
          <div className="absolute inset-0 z-20 grid place-items-center bg-stone-950/10 px-5" role="status">
            <div
              aria-live="assertive"
              className={`relative max-w-sm rounded-sm border px-5 py-4 text-center shadow-xl ${checkoutStatus === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-950" : checkoutStatus === "error" ? "border-red-200 bg-red-50 text-red-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}
            >
              <Button
                aria-label="Dismiss checkout message"
                className="absolute right-1 top-1"
                onClick={() => {
                  setCheckoutStatus("idle");
                  setMessage("");
                  setConfirmedOrderId(null);
                }}
                size="icon-xs"
                variant="ghost"
              >
                <Icon name="X" />
              </Button>
              <p className="font-semibold">{checkoutStatus === "success" ? "Order placed" : "Checkout unavailable"}</p>
              <p className="mt-1 text-sm">{message}</p>
              {checkoutStatus === "success" && confirmedOrderId ? (
                <Link
                  className="mt-3 inline-flex rounded-sm bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  href={`/order-tracking?id=${encodeURIComponent(confirmedOrderId)}`}
                  onClick={closeCart}
                >
                  Track this order
                </Link>
              ) : null}
              {countdownSeconds > 0 ? (
                <p className="mt-2 text-sm font-bold">Try again in {formatCountdown(countdownSeconds)}.</p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-b border-[#eadfca] px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">Your selection</p>
            <div className="mt-2 flex gap-3" role="tablist">
              <button
                aria-selected={activeTab === "cart"}
                className={`border-b-2 pb-1 text-sm font-bold ${activeTab === "cart" ? "border-amber-700 text-stone-950" : "border-transparent text-stone-500"}`}
                onClick={() => setActiveTab("cart")}
                role="tab"
                type="button"
              >
                Cart ({items.length})
              </button>
              <button
                aria-selected={activeTab === "history"}
                className={`border-b-2 pb-1 text-sm font-bold ${activeTab === "history" ? "border-amber-700 text-stone-950" : "border-transparent text-stone-500"}`}
                onClick={() => setActiveTab("history")}
                role="tab"
                type="button"
              >
                History ({history.length})
              </button>
            </div>
          </div>
          <Button aria-label="Close cart" onClick={closeCart} size="icon" variant="ghost">
            <Icon name="X" />
          </Button>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-5 py-4">
          {activeTab === "history" ? (
            history.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Saved locally in browser</span>
                  {history.length > 1 ? (
                    <button
                      className="cursor-pointer font-semibold text-stone-500 transition-colors hover:text-rose-700"
                      onClick={() => setOrderToDelete("all")}
                      type="button"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>
                {history.map((order) => (
                  <article
                    className="rounded-sm border border-[#eadfca] bg-white p-3 transition hover:border-amber-300 hover:bg-[#fffaf0]"
                    key={order.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        className="group min-w-0 flex-1"
                        href={`/order-tracking?id=${encodeURIComponent(order.id)}`}
                        onClick={closeCart}
                      >
                        <p className="font-bold text-stone-900 transition-colors group-hover:text-amber-800">
                          Order {order.id}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                        </p>
                      </Link>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 capitalize">
                          {order.status}
                        </span>
                        <Button
                          aria-label={`Delete order ${order.id} from local history`}
                          className="text-stone-400 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => setOrderToDelete(order)}
                          size="icon-xs"
                          title="Delete from local storage"
                          type="button"
                          variant="ghost"
                        >
                          <Icon name="Trash2" />
                        </Button>
                      </div>
                    </div>
                    <Link
                      className="mt-3 flex items-center justify-between text-sm"
                      href={`/order-tracking?id=${encodeURIComponent(order.id)}`}
                      onClick={closeCart}
                    >
                      <time className="text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</time>
                      <span className="font-bold text-stone-900">{formatBDT(order.total)}</span>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyHistory />
            )
          ) : items.length ? (
            <div className="space-y-3">
              {items.map((item) => (
                <article className="flex gap-3 rounded-sm border border-[#eadfca] bg-white p-3" key={item.id}>
                  <Image
                    alt={item.title}
                    className="size-16 rounded-sm object-cover"
                    height={64}
                    src={item.image}
                    unoptimized
                    width={64}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-800">{item.title}</h3>
                      <Button
                        aria-label={`Remove ${item.title}`}
                        className="text-rose-700 hover:bg-rose-50"
                        onClick={() => removeFromCart(item.id)}
                        size="icon-xs"
                        variant="ghost"
                      >
                        <Icon name="Trash2" />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm font-bold text-stone-950">{formatBDT(item.price)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div
                        aria-label={`Quantity for ${item.title}`}
                        className="flex items-center rounded-sm border border-[#eadfca] bg-[#fffaf0]"
                      >
                        <Button
                          aria-label={`Decrease ${item.title} quantity`}
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          size="icon-xs"
                          variant="ghost"
                        >
                          <Icon name="Minus" />
                        </Button>
                        <span className="w-7 text-center text-sm font-semibold" aria-live="polite">
                          {item.quantity}
                        </span>
                        <Button
                          aria-label={`Increase ${item.title} quantity`}
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          size="icon-xs"
                          variant="ghost"
                        >
                          <Icon name="Plus" />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold text-stone-700">
                        {formatBDT(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-amber-800">
                <Icon name="ShoppingCart" />
              </span>
              <h3 className="mt-4 font-bold text-stone-900">Your cart is empty</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-stone-500">
                Add an available product to continue.
              </p>
            </div>
          )}
        </ScrollArea>

        {activeTab === "cart" && items.length ? (
          <div className="border-t border-[#eadfca] bg-white px-5 py-4">
            <div className="space-y-1.5">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Input
                    aria-describedby={phoneTouched && !phoneValidation.isValid ? "cart-phone-error" : undefined}
                    aria-invalid={phoneTouched && !phoneValidation.isValid}
                    aria-label="Phone number"
                    className={
                      phoneTouched && !phoneValidation.isValid ? "border-red-400 focus-visible:ring-red-300" : ""
                    }
                    onBlur={() => setPhoneTouched(true)}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      if (!phoneTouched) setPhoneTouched(true);
                    }}
                    placeholder="Phone number (required: 01... or +880...)"
                    required
                    value={phone}
                  />
                  {phoneTouched && !phoneValidation.isValid ? (
                    <p className="mt-1 text-xs font-medium text-red-600" id="cart-phone-error">
                      {phoneValidation.error}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Input
                    aria-label="Delivery address"
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Delivery address (optional)"
                    value={address}
                  />
                </div>
              </div>
            </div>
            {countdownSeconds > 0 ? (
              <p className="mt-3 text-center text-sm font-semibold text-red-700">
                Order limit active. Try again in {formatCountdown(countdownSeconds)}.
              </p>
            ) : null}
            <Button
              className="mt-4 w-full bg-stone-900 text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={checkoutDisabled}
              onClick={() => void handleCheckout()}
              size="lg"
              type="button"
            >
              {checkoutStatus === "processing"
                ? "Placing order…"
                : countdownSeconds > 0
                  ? `Try again in ${formatCountdown(countdownSeconds)}`
                  : phoneTouched && !phoneValidation.isValid
                    ? "Valid phone number required"
                    : "Place order"}
            </Button>
          </div>
        ) : null}
      </aside>
      <AlertDialog
        confirmLabel={orderToDelete === "all" ? "Clear all" : "Delete"}
        description={
          orderToDelete === "all"
            ? "This will delete all saved order records from your browser's local storage. This will not cancel any placed orders."
            : `Are you sure you want to delete order ${orderToDelete?.id} from your history? This will only delete it from your local storage and will not cancel the order.`
        }
        onCancel={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete === "all") {
            clearOrderHistory();
          } else if (orderToDelete) {
            removeOrderFromHistory(orderToDelete.id);
          }
          setOrderToDelete(null);
        }}
        open={orderToDelete !== null}
        title={orderToDelete === "all" ? "Clear all order history?" : `Delete order ${orderToDelete?.id}?`}
      />
    </div>,
    document.body,
  );
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function EmptyHistory() {
  return (
    <div className="py-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-amber-800">
        <Icon name="Package" />
      </span>
      <h3 className="mt-4 font-bold text-stone-900">No orders yet</h3>
      <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-stone-500">Confirmed orders will appear here.</p>
    </div>
  );
}
