/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { invalidateDashboardCache, redisKeys } from "@/app/api/lib/redis";

type SidebarItem = { id: string; parentId: string | null };
export async function DELETE(request: Request) {
  const limited = rateLimit(request, "sidebar-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/sidebars/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { ids?: string[] } | null;
  const roots = [...new Set(body?.ids?.filter((id): id is string => typeof id === "string" && id.length > 0) ?? [])];
  if (!roots.length) return Response.json({ error: "Select at least one sidebar item." }, { status: 400 });
  const collection = client.db().collection<SidebarItem>("sidebar");
  const ids = new Set(roots);
  const queue = [...roots];
  while (queue.length) {
    const parentId = queue.shift()!;
    const children = await collection.find({ parentId }, { projection: { id: 1 } }).toArray();
    children.forEach((child) => {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        queue.push(child.id);
      }
    });
  }
  const result = await collection.deleteMany({ id: { $in: [...ids] } });
  await invalidateDashboardCache(redisKeys.sidebars, redisKeys.roles);
  return Response.json({ deletedCount: result.deletedCount });
}
