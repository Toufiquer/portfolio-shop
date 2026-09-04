/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 16 August 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { invalidateDashboardCache, redisKeys } from "@/app/api/lib/redis";

export async function DELETE(request: Request) {
  const limited = rateLimit(request, "access-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/access/v1", "DELETE");
  if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { ids?: string[] } | null;
  const ids = [...new Set(body?.ids?.filter((id): id is string => typeof id === "string" && id.length > 0) ?? [])];
  if (!ids.length) return Response.json({ error: "Select at least one access record." }, { status: 400 });
  const result = await client.db().collection("access").deleteMany({ id: { $in: ids } });
  await invalidateDashboardCache(redisKeys.access);
  return Response.json({ deletedCount: result.deletedCount });
}
