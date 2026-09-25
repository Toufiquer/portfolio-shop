/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, canAccessMaintenanceTools } from "@/app/api/lib/dashboard-authorization";

import { importDefaultData } from "./service";

export async function POST(request: Request) {
  const limited = rateLimit(request, "import-sidebar-api", 10, 60_000);
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!canAccessMaintenanceTools(session)) {
    const authorization = await authorizeDashboardRequest(session, "/dashboard/developer/sidebar", "POST");
    if (!authorization.allowed)
      return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    pagePaths?: unknown;
    sidebarUrls?: unknown;
    target?: "all" | "sidebar" | "pages";
  } | null;
  return Response.json(await importDefaultData(body));
}
