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

type UserDocument = {
  _id?: ObjectId;
  id?: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string | null;
  mobileNumber?: string;
  address?: string;
  bio?: string;
  profilePicture?: string;
  gender?: string;
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

function serializeUser(user: UserDocument) {
  return {
    id: user.id || user._id?.toHexString() || "",
    name: user.name ?? "",
    email: user.email ?? "",
    emailVerified: Boolean(user.emailVerified),
    image: user.image ?? null,
    mobileNumber: user.mobileNumber ?? "",
    address: user.address ?? "",
    bio: user.bio ?? "",
    profilePicture: user.profilePicture ?? "",
    gender: user.gender ?? "",
    createdAt: user.createdAt?.toISOString() ?? null,
    updatedAt: user.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(request: Request) {
  const limited = rateLimit(request, "dashboard-users-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/users/v1", "GET");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 1);
  const limit = Math.min(positiveInteger(url.searchParams.get("limit"), 25), MAX_PAGE_SIZE);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const filter = q
    ? {
        $or: [
          { name: { $regex: escapeRegex(q), $options: "i" } },
          { email: { $regex: escapeRegex(q), $options: "i" } },
          { mobileNumber: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }
    : {};
  const usersCollection = client.db().collection<UserDocument>("user");
  const [total, users] = await Promise.all([
    usersCollection.countDocuments(filter),
    usersCollection
      .find(filter, {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          emailVerified: 1,
          image: 1,
          mobileNumber: 1,
          address: 1,
          bio: 1,
          profilePicture: 1,
          gender: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
  ]);
  return Response.json({ users: users.map(serializeUser), total, page, limit });
}
