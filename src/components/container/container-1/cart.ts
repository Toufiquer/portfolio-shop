/*
|-----------------------------------------
| setting up cart.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 24 August, 2026
|-----------------------------------------
*/

"use client";

export interface ContainerCartItem {
  productId: number;
  containerUid: string;
  containerName: string;
  title: string;
  price: string;
  image: string;
}

const CART_STORAGE_KEY = "speed-box:container-cart";

export const addContainerItemToCart = (item: ContainerCartItem) => {
  if (typeof window === "undefined") return;

  const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);
  const cartItems = storedItems ? (JSON.parse(storedItems) as ContainerCartItem[]) : [];
  const existingItemIndex = cartItems.findIndex(
    (cartItem) => cartItem.productId === item.productId && cartItem.containerUid === item.containerUid,
  );

  if (existingItemIndex >= 0) {
    cartItems[existingItemIndex] = item;
  } else {
    cartItems.push(item);
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  window.dispatchEvent(new CustomEvent("speed-box:container-cart-updated", { detail: cartItems }));
};
