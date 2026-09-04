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

type VerificationDocument = {
  _id?: ObjectId;
  id?: string;
  identifier?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
const MAX_PAGE_SIZE = 100;
function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeVerification(verification: VerificationDocument) {
  return {
    id: verification.id || verification._id?.toHexString() || "",
    identifier: verification.identifier ?? "",
    type: verification.identifier?.split(":")[0] || "verification",
    expiresAt: verification.expiresAt?.toISOString() ?? null,
    createdAt: verification.createdAt?.toISOString() ?? null,
    updatedAt: verification.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(request: Request) {
  const limited = rateLimit(request, "dashboard-verifications-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/verifications/v1", "GET");
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
          { identifier: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }
    : {};
  const collection = client.db().collection<VerificationDocument>("verification");
  const [total, verifications] = await Promise.all([
    collection.countDocuments(filter),
    collection
      .find(filter, { projection: { id: 1, identifier: 1, expiresAt: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
  ]);
  return Response.json({ verifications: verifications.map(serializeVerification), total, page, limit });
}
