/*
|-----------------------------------------
| setting up proxy.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { NextResponse, type NextRequest } from "next/server";

import { rateLimitDistributed } from "@/app/api/lib/api-rate-limit";
import { auth } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, isPublicDashboardRead } from "@/app/api/lib/dashboard-authorization";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/dashboard/");
  if (isApi && isPublicDashboardRead(pathname, request.method)) return NextResponse.next();

  const limited = await rateLimitDistributed(request, "dashboard-authorization", 120, 60_000);
  if (limited) return limited;

  // Cookie-authenticated writes must originate from this site. This closes the
  // CSRF path before a route handler can mutate dashboard data.
  if (isApi && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin && host && new URL(origin).host !== host)
      return Response.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    if (isApi) return Response.json({ error: "Sign in required." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const authorization = await authorizeDashboardRequest(session, pathname, request.method);
  if (isApi) {
    if (!authorization.allowed)
      return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.delete("x-dashboard-authorization");
  headers.delete("x-dashboard-authorization-message");
  headers.set("x-dashboard-authorization", authorization.allowed ? "allowed" : "denied");
  headers.set("x-dashboard-authorization-message", encodeURIComponent(authorization.state.message ?? "Unauthorized."));
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/dashboard/:path*", "/api/dashboard/:path*"] };
