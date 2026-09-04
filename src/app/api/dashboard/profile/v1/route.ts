/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";

const genders = new Set(["", "Male", "Female", "Other"]);

export async function GET(request: Request) {
  const limited = rateLimit(request, "dashboard-profile-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/profile/v1", "GET");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const userFilter = { $or: [{ id: activeSession.user.id }, { email: activeSession.user.email }] };
  const user = await client
    .db()
    .collection("user")
    .findOne(userFilter, {
      projection: { id: 1, name: 1, email: 1, mobileNumber: 1, address: 1, bio: 1, profilePicture: 1, gender: 1 },
    });
  return Response.json({
    profile: {
      name: user?.name ?? activeSession.user.name ?? "",
      email: user?.email ?? activeSession.user.email ?? "",
      mobileNumber: user?.mobileNumber ?? "",
      address: user?.address ?? "",
      bio: user?.bio ?? "",
      profilePicture: user?.profilePicture ?? activeSession.user.image ?? "",
      gender: user && genders.has(user.gender) ? user.gender : "",
    },
  });
}

export async function PATCH(request: Request) {
  const limited = rateLimit(request, "dashboard-profile-api", 30, 60_000);
  if (limited) return limited;
  const activeSession = await auth.api.getSession({ headers: request.headers });
  if (!activeSession) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(activeSession, "/api/dashboard/profile/v1", "PATCH");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const userFilter = { $or: [{ id: activeSession.user.id }, { email: activeSession.user.email }] };
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    mobileNumber?: string;
    address?: string;
    bio?: string;
    profilePicture?: string;
    gender?: string;
  } | null;
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  const gender = body?.gender ?? "";
  if (!genders.has(gender)) return Response.json({ error: "Invalid gender." }, { status: 400 });
  const profilePicture = body?.profilePicture?.trim() ?? "";
  if (profilePicture && !/^https?:\/\//i.test(profilePicture))
    return Response.json({ error: "Invalid profile picture." }, { status: 400 });
  const profile = {
    name,
    email: activeSession.user.email,
    mobileNumber: body?.mobileNumber?.trim() ?? "",
    address: body?.address?.trim() ?? "",
    bio: body?.bio?.trim() ?? "",
    profilePicture,
    gender,
  };
  await client
    .db()
    .collection("user")
    .updateOne(
      userFilter,
      {
        $set: { ...profile, updatedAt: new Date() },
        $setOnInsert: { id: activeSession.user.id, createdAt: new Date(), emailVerified: false },
      },
      { upsert: true },
    );
  return Response.json({ profile });
}
