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

function userFilter(id: string) {
  return ObjectId.isValid(id) ? { $or: [{ id }, { _id: new ObjectId(id) }] } : { id };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "dashboard-users-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/users/v1", "PATCH");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    mobileNumber?: string;
    emailVerified?: boolean;
  } | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  if (!name || !email) return Response.json({ error: "Name and email are required." }, { status: 400 });
  const duplicate = await client
    .db()
    .collection("user")
    .findOne({ email, $nor: [userFilter(id)] }, { projection: { id: 1 } });
  if (duplicate) return Response.json({ error: "This email is already in use." }, { status: 409 });
  const result = await client
    .db()
    .collection("user")
    .updateOne(userFilter(id), {
      $set: {
        name,
        email,
        mobileNumber: body?.mobileNumber?.trim() ?? "",
        emailVerified: Boolean(body?.emailVerified),
        updatedAt: new Date(),
      },
    });
  if (!result.matchedCount) return Response.json({ error: "User not found." }, { status: 404 });
  return Response.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "dashboard-users-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/users/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const database = client.db();
  const result = await database.collection("user").deleteOne(userFilter(id));
  if (!result.deletedCount) return Response.json({ error: "User not found." }, { status: 404 });
  await Promise.all([
    database.collection("account").deleteMany({ userId: id }),
    database.collection("session").deleteMany({ userId: id }),
  ]);
  return Response.json({ success: true });
}
