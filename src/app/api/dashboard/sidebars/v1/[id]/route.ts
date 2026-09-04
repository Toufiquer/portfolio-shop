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

type SidebarItem = {
  id: string;
  name: string;
  url: string;
  icon: string;
  parentId: string | null;
  position: number;
  updatedAt?: Date;
};
async function access(request: Request) {
  const limited = rateLimit(request, "sidebar-api");
  if (limited) return { limited };
  const session = await auth.api.getSession({ headers: request.headers });
  return { limited: null, session };
}
async function descendants(id: string) {
  const collection = client.db().collection<SidebarItem>("sidebar");
  const result: string[] = [];
  const queue = [id];
  while (queue.length) {
    const parentId = queue.shift()!;
    const children = await collection.find({ parentId }, { projection: { id: 1 } }).toArray();
    children.forEach((child) => {
      result.push(child.id);
      queue.push(child.id);
    });
  }
  return result;
}
async function depthFor(parentId: string | null) {
  let depth = 0;
  let current = parentId;
  const collection = client.db().collection<SidebarItem>("sidebar");
  while (current) {
    const parent = await collection.findOne({ id: current }, { projection: { parentId: 1 } });
    if (!parent) return -1;
    depth += 1;
    current = parent.parentId;
  }
  return Math.max(0, depth - 1);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/sidebars/v1", "PATCH");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Partial<SidebarItem> | null;
  const collection = client.db().collection<SidebarItem>("sidebar");
  const item = await collection.findOne({ id });
  if (!item) return Response.json({ error: "Sidebar item not found." }, { status: 404 });
  const name = body?.name?.trim();
  const url = body?.url?.trim();
  const icon = body?.icon?.trim();
  const parentId = body?.parentId === undefined ? item.parentId : body.parentId || null;
  if (!name || !url) return Response.json({ error: "Name and URL are required." }, { status: 400 });
  if (parentId === id || (await descendants(id)).includes(parentId ?? ""))
    return Response.json({ error: "An item cannot be placed inside itself or one of its children." }, { status: 400 });
  const depth = await depthFor(parentId);
  if (depth < 0 || depth > 1)
    return Response.json(
      { error: "Sidebar items support grand parent, parent, and child levels only." },
      { status: 400 },
    );
  await collection.updateOne(
    { id },
    {
      $set: {
        name,
        url,
        icon: icon || "•",
        parentId,
        position: typeof body?.position === "number" ? body.position : item.position,
        updatedAt: new Date(),
      },
    },
  );
  await invalidateDashboardCache(redisKeys.sidebars, redisKeys.roles);
  return Response.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/sidebars/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const ids = [id, ...(await descendants(id))];
  const result = await client
    .db()
    .collection("sidebar")
    .deleteMany({ id: { $in: ids } });
  if (!result.deletedCount) return Response.json({ error: "Sidebar item not found." }, { status: 404 });

  if (ids.length) {
    const unsets: Record<string, string> = {};
    for (const item of ids) {
      unsets[`permissions.${item}`] = "";
    }
    await client.db().collection("role").updateMany({}, { $unset: unsets });
  }

  await invalidateDashboardCache(redisKeys.sidebars, redisKeys.roles);
  return Response.json({ deletedCount: result.deletedCount });
}
