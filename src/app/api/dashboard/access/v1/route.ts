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
import { invalidateDashboardCache, redisKeys } from "@/app/api/lib/redis";

type Access = {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  blocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
type Role = { id: string; name: string };
const pageSizes = [10, 25, 50, 100];
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const serialize = (item: Access) => ({
  ...item,
  createdAt: item.createdAt?.toISOString() ?? null,
  updatedAt: item.updatedAt?.toISOString() ?? null,
});
async function access(request: Request) {
  const limited = rateLimit(request, "access-api");
  if (limited) return { limited };
  return { limited: null, session: await auth.api.getSession({ headers: request.headers }) };
}

export async function GET(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/access/v1", "GET");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedPageSize = Number(searchParams.get("pageSize"));
  const pageSize = pageSizes.includes(requestedPageSize) ? requestedPageSize : 10;
  const search = searchParams.get("search")?.trim() ?? "";
  const roleId = searchParams.get("roleId")?.trim() ?? "";
  const query = {
    ...(roleId ? { roleId } : {}),
    ...(search
      ? {
          $or: [
            { email: { $regex: escapeRegex(search), $options: "i" } },
            { roleName: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {}),
  };
  const database = client.db();
  const [items, total, roles, roleCounts] = await Promise.all([
    database
      .collection<Access>("access")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    database.collection<Access>("access").countDocuments(query),
    database
      .collection<Role>("role")
      .find({}, { projection: { id: 1, name: 1 } })
      .sort({ name: 1 })
      .toArray(),
    database
      .collection<Access>("access")
      .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$roleId", count: { $sum: 1 } } }])
      .toArray(),
  ]);
  return Response.json({
    items: items.map(serialize),
    roles,
    total,
    page,
    pageSize,
    roleCounts: Object.fromEntries(roleCounts.map(({ _id, count }) => [_id, count])),
  });
}
export async function POST(request: Request) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/access/v1", "POST");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as Partial<Access> | null;
  const email = body?.email?.trim().toLowerCase();
  const roleId = body?.roleId?.trim();
  if (!email || !roleId) return Response.json({ error: "Email and role are required." }, { status: 400 });
  const database = client.db();
  const [user, role, duplicate] = await Promise.all([
    database.collection("user").findOne({ email }, { projection: { id: 1 } }),
    database.collection<Role>("role").findOne({ id: roleId }),
    database.collection("access").findOne({ email }, { projection: { id: 1 } }),
  ]);
  if (!user) return Response.json({ error: "User email was not found." }, { status: 404 });
  if (!role) return Response.json({ error: "Role was not found." }, { status: 404 });
  if (duplicate)
    return Response.json({ error: "This user already has access. Edit the existing record instead." }, { status: 409 });
  const item: Access = {
    id: randomUUID(),
    email,
    roleId: role.id,
    roleName: role.name,
    blocked: Boolean(body?.blocked),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await database.collection<Access>("access").insertOne(item);
  await invalidateDashboardCache(redisKeys.access);
  return Response.json({ item: serialize(item) }, { status: 201 });
}
