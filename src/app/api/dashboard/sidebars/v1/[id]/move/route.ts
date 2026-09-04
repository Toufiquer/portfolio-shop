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

type SidebarItem = { id: string; parentId: string | null; position: number };
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "sidebar-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/sidebars/v1", "POST");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { direction?: "up" | "down" } | null;
  if (body?.direction !== "up" && body?.direction !== "down")
    return Response.json({ error: "Invalid move direction." }, { status: 400 });
  const collection = client.db().collection<SidebarItem>("sidebar");
  const item = await collection.findOne({ id });
  if (!item) return Response.json({ error: "Sidebar item not found." }, { status: 404 });
  const siblings = await collection.find({ parentId: item.parentId }).sort({ position: 1, id: 1 }).toArray();
  const index = siblings.findIndex((sibling) => sibling.id === id);
  const swapWith = siblings[index + (body.direction === "up" ? -1 : 1)];
  if (!swapWith)
    return Response.json(
      { error: `This sidebar item is already at the ${body.direction === "up" ? "top" : "bottom"}.` },
      { status: 409 },
    );
  await Promise.all([
    collection.updateOne({ id }, { $set: { position: swapWith.position, updatedAt: new Date() } }),
    collection.updateOne({ id: swapWith.id }, { $set: { position: item.position, updatedAt: new Date() } }),
  ]);
  await invalidateDashboardCache(redisKeys.sidebars, redisKeys.roles);
  return Response.json({ success: true });
}
