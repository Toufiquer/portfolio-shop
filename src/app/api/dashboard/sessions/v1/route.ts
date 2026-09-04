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

type SessionDocument = {
  _id?: ObjectId;
  id?: string;
  userId?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
};

const MAX_PAGE_SIZE = 100;
function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeSession(session: SessionDocument) {
  return {
    id: session.id || session._id?.toHexString() || "",
    userId: session.userId ?? "",
    expiresAt: session.expiresAt?.toISOString() ?? null,
    createdAt: session.createdAt?.toISOString() ?? null,
    updatedAt: session.updatedAt?.toISOString() ?? null,
    ipAddress: session.ipAddress ?? "",
    userAgent: session.userAgent ?? "",
  };
}

export async function GET(request: Request) {
  const limited = rateLimit(request, "dashboard-sessions-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/sessions/v1", "GET");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });

  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 1);
  const limit = Math.min(positiveInteger(url.searchParams.get("limit"), 25), MAX_PAGE_SIZE);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const filter = q
    ? {
        $or: [
          { id: { $regex: escapeRegex(q), $options: "i" } },
          { userId: { $regex: escapeRegex(q), $options: "i" } },
          { ipAddress: { $regex: escapeRegex(q), $options: "i" } },
          { userAgent: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }
    : {};
  const collection = client.db().collection<SessionDocument>("session");
  const [total, sessions] = await Promise.all([
    collection.countDocuments(filter),
    collection
      .find(filter, {
        projection: { id: 1, userId: 1, expiresAt: 1, createdAt: 1, updatedAt: 1, ipAddress: 1, userAgent: 1 },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
  ]);
  return Response.json({ sessions: sessions.map(serializeSession), total, page, limit });
}
