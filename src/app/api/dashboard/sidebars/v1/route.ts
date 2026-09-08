/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";
import { getCache, invalidateDashboardCache, redisKeys, setCache } from "@/app/api/lib/redis";

type SidebarItem = {
  id: string;
  name: string;
  url: string;
  icon: string;
  parentId: string | null;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
};

function responseItem(item: SidebarItem) {
  return {
    ...item,
    createdAt: item.createdAt?.toISOString() ?? null,
    updatedAt: item.updatedAt?.toISOString() ?? null,
  };
}
async function access(request: Request) {
  const limited = rateLimit(request, "sidebar-api");
  if (limited) return { limited };
  const session = await auth.api.getSession({ headers: request.headers });
  return { limited: null, session };
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

export async function GET(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await getDashboardAccessState(session);
  if (authorization.blocked) return Response.json({ error: authorization.message ?? "Unauthorized." }, { status: 403 });
  const cached = await getCache<{ items: ReturnType<typeof responseItem>[] }>(redisKeys.sidebars);
  const items =
    cached?.items ??
    (
      await client
        .db()
        .collection<SidebarItem>("sidebar")
        .find(
          {},
          { projection: { id: 1, name: 1, url: 1, icon: 1, parentId: 1, position: 1, createdAt: 1, updatedAt: 1 } },
        )
        .sort({ parentId: 1, position: 1, name: 1 })
        .toArray()
    ).map(responseItem);
  const allowedIds = new Set(authorization.allowedSidebarIds);
  const visibleIds = new Set(allowedIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of items) {
      if (visibleIds.has(item.id) && item.parentId && !visibleIds.has(item.parentId)) {
        visibleIds.add(item.parentId);
        changed = true;
      }
    }
  }
  const payload = {
    items: items.filter((item) => authorization.bypassed || visibleIds.has(item.id)),
  };
  if (!cached) await setCache(redisKeys.sidebars, { items });
  return Response.json(payload);
}

export async function POST(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/sidebars/v1", "POST");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as Partial<SidebarItem> | null;
  const name = body?.name?.trim();
  const url = body?.url?.trim();
  const icon = body?.icon?.trim() || "•";
  const parentId = body?.parentId || null;
  if (!name || !url) return Response.json({ error: "Name and URL are required." }, { status: 400 });
  const depth = await depthFor(parentId);
  if (depth < 0 || depth > 1)
    return Response.json(
      { error: "Sidebar items support grand parent, parent, and child levels only." },
      { status: 400 },
    );
  const collection = client.db().collection<SidebarItem>("sidebar");
  const last = await collection.find({ parentId }).sort({ position: -1 }).limit(1).next();
  const item: SidebarItem = {
    id: randomUUID(),
    name,
    url,
    icon,
    parentId,
    position: typeof body?.position === "number" ? body.position : (last?.position ?? -1) + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await collection.insertOne(item);
  await invalidateDashboardCache(redisKeys.sidebars, redisKeys.roles);
  return Response.json({ item: responseItem(item) }, { status: 201 });
}
