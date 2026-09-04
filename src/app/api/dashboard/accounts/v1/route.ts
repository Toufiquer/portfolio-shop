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

type AccountDocument = {
  _id?: ObjectId;
  id?: string;
  accountId?: string;
  providerId?: string;
  userId?: string;
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

function serializeAccount(account: AccountDocument) {
  return {
    id: account.id || account._id?.toHexString() || "",
    accountId: account.accountId ?? "",
    providerId: account.providerId ?? "",
    userId: account.userId ?? "",
    createdAt: account.createdAt?.toISOString() ?? null,
    updatedAt: account.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(request: Request) {
  const limited = rateLimit(request, "dashboard-accounts-api", 30, 60_000);
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/accounts/v1", "GET");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });

  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 1);
  const limit = Math.min(positiveInteger(url.searchParams.get("limit"), 25), MAX_PAGE_SIZE);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const filter = q
    ? {
        $or: [
          { providerId: { $regex: escapeRegex(q), $options: "i" } },
          { accountId: { $regex: escapeRegex(q), $options: "i" } },
          { userId: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }
    : {};
  const accountsCollection = client.db().collection<AccountDocument>("account");
  const [total, accounts] = await Promise.all([
    accountsCollection.countDocuments(filter),
    accountsCollection
      .find(filter, { projection: { id: 1, accountId: 1, providerId: 1, userId: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
  ]);

  return Response.json({ accounts: accounts.map(serializeAccount), total, page, limit });
}
