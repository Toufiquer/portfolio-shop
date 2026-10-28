/*
|-----------------------------------------
| setting up badge.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import { cn } from "@/app/api/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span"> & { variant?: "default" | "outline" }) {
  return <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium", className)} {...props} />;
}

export { Badge };
