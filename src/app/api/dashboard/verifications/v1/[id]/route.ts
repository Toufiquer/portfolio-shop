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

function verificationFilter(id: string) {
  return ObjectId.isValid(id) ? { $or: [{ id }, { _id: new ObjectId(id) }] } : { id };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "dashboard-verifications-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/verifications/v1", "PATCH");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { expiresAt?: string } | null;
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;
  if (!expiresAt || Number.isNaN(expiresAt.getTime()))
    return Response.json({ error: "Enter a valid expiration date." }, { status: 400 });

  const result = await client
    .db()
    .collection("verification")
    .updateOne(verificationFilter(id), { $set: { expiresAt, updatedAt: new Date() } });
  if (!result.matchedCount) return Response.json({ error: "Verification not found." }, { status: 404 });
  return Response.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "dashboard-verifications-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/verifications/v1", "DELETE");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });

  const { id } = await params;
  const result = await client.db().collection("verification").deleteOne(verificationFilter(id));
  if (!result.deletedCount) return Response.json({ error: "Verification not found." }, { status: 404 });
  return Response.json({ success: true });
}
