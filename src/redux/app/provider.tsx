/*
|-----------------------------------------
| setting up provider.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

"use client";

import { Provider } from "react-redux";

import { store } from "@/redux/app/store";

export function ReduxProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Provider store={store}>{children}</Provider>;
}
