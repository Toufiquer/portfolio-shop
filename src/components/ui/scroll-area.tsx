/*
|-----------------------------------------
| setting up scroll-area.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import { cn } from "@/app/api/lib/utils";

function ScrollArea({ className, children, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("overflow-auto", className)} {...props}>{children}</div>;
}

export { ScrollArea };
