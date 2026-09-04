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
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { getCache, invalidateDashboardCache, redisKeys, setCache } from "@/app/api/lib/redis";

type Permission = { read: boolean; create: boolean; update: boolean; delete: boolean };
type Role = {
  id: string;
  name: string;
  responsible: string;
  icon: string;
  position: number;
  permissions: Record<string, Permission>;
  createdAt?: Date;
  updatedAt?: Date;
};
type Sidebar = { id: string; name: string; url: string; icon: string; parentId: string | null; position: number };
function serialize(role: Role) {
  return {
    ...role,
    responsible: role.responsible ?? "",
    createdAt: role.createdAt?.toISOString() ?? null,
    updatedAt: role.updatedAt?.toISOString() ?? null,
  };
}
async function access(request: Request) {
  const limited = rateLimit(request, "role-api");
  if (limited) return { limited };
  return { limited: null, session: await auth.api.getSession({ headers: request.headers }) };
}
function cleanPermissions(input: Record<string, Partial<Permission>> | undefined, sidebars: Sidebar[]) {
  return Object.fromEntries(
    sidebars.map((sidebar) => [
      sidebar.id,
      {
        read: Boolean(input?.[sidebar.id]?.read),
        create: Boolean(input?.[sidebar.id]?.create),
        update: Boolean(input?.[sidebar.id]?.update),
        delete: Boolean(input?.[sidebar.id]?.delete),
      },
    ]),
  ) as Record<string, Permission>;
}

export async function GET(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/roles/v1", "GET");
  if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const cached = await getCache<{ roles: ReturnType<typeof serialize>[]; sidebars: Sidebar[] }>(redisKeys.roles);
  if (cached) return Response.json(cached);
  const database = client.db();
  const [roles, sidebars] = await Promise.all([
    database.collection<Role>("role").find({}).sort({ position: 1, name: 1 }).toArray(),
    database
      .collection<Sidebar>("sidebar")
      .find({}, { projection: { id: 1, name: 1, url: 1, icon: 1, parentId: 1, position: 1 } })
      .sort({ position: 1, name: 1 })
      .toArray(),
  ]);
  const payload = { roles: roles.map(serialize), sidebars };
  await setCache(redisKeys.roles, payload);
  return Response.json(payload);
}
export async function POST(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/roles/v1", "POST");
  if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as Partial<Role> | null;
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "Role name is required." }, { status: 400 });
  const database = client.db();
  const sidebars = await database
    .collection<Sidebar>("sidebar")
    .find({}, { projection: { id: 1 } })
    .toArray();
  const last = await database.collection<Role>("role").find({}).sort({ position: -1 }).limit(1).next();
  const role: Role = {
    id: randomUUID(),
    name,
    responsible: body?.responsible?.trim() || "",
    icon: body?.icon?.trim() || "ShieldCheck",
    position: typeof body?.position === "number" ? body.position : (last?.position ?? -1) + 1,
    permissions: cleanPermissions(body?.permissions, sidebars),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await database.collection<Role>("role").insertOne(role);
  await invalidateDashboardCache(redisKeys.roles, redisKeys.access);
  return Response.json({ role: serialize(role) }, { status: 201 });
}
