/*
|-----------------------------------------
| setting up Mutation.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import type { MenuData } from "../menu-1/data";

/** Menu-2 owns this merge point for future compact-layout fields. */
export const mutateMenuTwo = (data: MenuData, patch: Partial<MenuData>): MenuData => ({
  ...data,
  ...patch,
  variant: "menu-2",
});
