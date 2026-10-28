/*
|-----------------------------------------
| setting up Mutation.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import type { MenuData } from "../menu-1/data";

/** Menu-3 preserves arbitrary mixed layout JSON while applying dashboard changes. */
export const mutateMenuThree = (data: MenuData, patch: Partial<MenuData>): MenuData => ({
  ...data,
  ...patch,
  variant: "menu-3",
});
