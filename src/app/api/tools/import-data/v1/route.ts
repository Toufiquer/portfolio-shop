/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";
import { validateCookieApiWrite } from "@/app/api/lib/request-security";
import { dashboardCan } from "@/lib/dashboard/permissions";

import { findImportPagePaths, findImportSidebars } from "./model";
import { importDefaultData, resetDefaultData } from "./service";

async function permissions(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  const state = await getDashboardAccessState(session);
  const canResetSidebars = dashboardCan(state, "/dashboard/developer/sidebar", "delete");
  const canResetPages = dashboardCan(state, "/dashboard/admin/pages", "delete");
  return {
    canImportSidebars:
      dashboardCan(state, "/dashboard/developer/sidebar", "create") &&
      dashboardCan(state, "/dashboard/developer/sidebar", "update"),
    canImportPages:
      dashboardCan(state, "/dashboard/admin/pages", "create") &&
      dashboardCan(state, "/dashboard/admin/pages", "update"),
    canReset: canResetSidebars && canResetPages,
    canResetPages,
    canResetSidebars,
  };
}

export async function GET(request: Request) {
  const limited = await rateLimitDistributed(request, "import-status-api");
  if (limited) return limited;
  const grants = await permissions(request);
  if (!grants) return Response.json({ error: "Sign in required." }, { status: 401 });
  const [sidebars, pages] = await Promise.all([
    grants.canImportSidebars || grants.canResetSidebars ? findImportSidebars() : [],
    grants.canImportPages || grants.canResetPages ? findImportPagePaths() : new Set<string>(),
  ]);
  return Response.json(
    { ...grants, sidebarUrls: sidebars.map((item) => item.url), pagePaths: [...pages] },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const limited = await rateLimitDistributed(request, "import-sidebar-api", 10, 60_000);
  if (limited) return limited;
  const rejected = validateCookieApiWrite(request);
  if (rejected) return rejected;
  const grants = await permissions(request);
  if (!grants) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    pagePaths?: unknown;
    sidebarUrls?: unknown;
    target?: "all" | "sidebar" | "pages";
  } | null;
  const sidebarSelected = Array.isArray(body?.sidebarUrls) ? body.sidebarUrls.length > 0 : body?.target !== "pages";
  const pagesSelected = Array.isArray(body?.pagePaths) ? body.pagePaths.length > 0 : body?.target !== "sidebar";
  if ((sidebarSelected && !grants.canImportSidebars) || (pagesSelected && !grants.canImportPages))
    return Response.json(
      { error: "Default synchronization requires Create and Update permission for each selected area." },
      { status: 403 },
    );
  return Response.json(await importDefaultData(body));
}

export async function DELETE(request: Request) {
  const limited = await rateLimitDistributed(request, "import-reset-api", 5, 60_000);
  if (limited) return limited;
  const rejected = validateCookieApiWrite(request);
  if (rejected) return rejected;
  const grants = await permissions(request);
  if (!grants) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!grants.canReset)
    return Response.json(
      { error: "Resetting defaults requires Delete permission for both Sidebar and Pages." },
      { status: 403 },
    );
  return Response.json(await resetDefaultData());
}
