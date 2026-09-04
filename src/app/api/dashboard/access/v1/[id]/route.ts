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

type Role = { id: string; name: string };
async function access(request: Request) {
  const limited = rateLimit(request, "access-api");
  if (limited) return { limited };
  return { limited: null, session: await auth.api.getSession({ headers: request.headers }) };
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/access/v1", "PATCH");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { roleId?: string; blocked?: boolean } | null;
  const roleId = body?.roleId?.trim();
  if (!roleId) return Response.json({ error: "Role is required." }, { status: 400 });
  const role = await client.db().collection<Role>("role").findOne({ id: roleId });
  if (!role) return Response.json({ error: "Role was not found." }, { status: 404 });
  const existing = await client
    .db()
    .collection<{ email: string }>("access")
    .findOne({ id }, { projection: { email: 1 } });
  if (!existing) return Response.json({ error: "Access record not found." }, { status: 404 });
  if (Boolean(body?.blocked) && existing.email.trim().toLowerCase() === session.user.email?.trim().toLowerCase())
    return Response.json({ error: "You cannot block your own account." }, { status: 400 });
  await client
    .db()
    .collection("access")
    .updateOne(
      { id },
      { $set: { roleId: role.id, roleName: role.name, blocked: Boolean(body?.blocked), updatedAt: new Date() } },
    );
  if (Boolean(body?.blocked)) {
    const user = await client
      .db()
      .collection<{ id: string }>("user")
      .findOne({ email: existing.email }, { projection: { id: 1 } });
    if (user?.id) await client.db().collection("session").deleteMany({ userId: user.id });
  }
  await invalidateDashboardCache(redisKeys.access);
  return Response.json({ success: true });
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { limited, session } = await access(request);
  if (limited) return limited;
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/access/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const existing = await client
    .db()
    .collection<{ email: string }>("access")
    .findOne({ id }, { projection: { email: 1 } });
  if (!existing) return Response.json({ error: "Access record not found." }, { status: 404 });
  if (existing.email.trim().toLowerCase() === session.user.email?.trim().toLowerCase())
    return Response.json({ error: "You cannot remove your own access." }, { status: 400 });
  await client.db().collection("access").deleteOne({ id });
  const user = await client
    .db()
    .collection<{ id: string }>("user")
    .findOne({ email: existing.email }, { projection: { id: 1 } });
  if (user?.id) await client.db().collection("session").deleteMany({ userId: user.id });
  await invalidateDashboardCache(redisKeys.access);
  return Response.json({ success: true });
}
