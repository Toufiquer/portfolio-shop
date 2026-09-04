/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { ObjectId } from "mongodb";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";

export async function DELETE(request: Request) {
  const limited = rateLimit(request, "dashboard-users-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/users/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { ids?: string[] } | null;
  const ids = [...new Set(body?.ids?.filter((id): id is string => typeof id === "string" && id.length > 0) ?? [])];
  if (!ids.length) return Response.json({ error: "Select at least one user." }, { status: 400 });
  const database = client.db();
  const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  const result = await database
    .collection("user")
    .deleteMany({ $or: [{ id: { $in: ids } }, ...(objectIds.length ? [{ _id: { $in: objectIds } }] : [])] });
  await Promise.all([
    database.collection("account").deleteMany({ userId: { $in: ids } }),
    database.collection("session").deleteMany({ userId: { $in: ids } }),
  ]);
  return Response.json({ deletedCount: result.deletedCount });
}
