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

type Permission = { read: boolean; create: boolean; update: boolean; delete: boolean };
type Role = { id: string; name: string; responsible: string; icon: string; position: number; permissions: Record<string, Permission> };
type Sidebar = { id: string };
async function allowed(request: Request, method: "PATCH" | "DELETE") { const limited = rateLimit(request, "role-api"); if (limited) return { response: limited }; const session = await auth.api.getSession({ headers: request.headers }); if (!session) return { response: Response.json({ error: "Sign in required." }, { status: 401 }) }; const authorization = await authorizeDashboardRequest(session, "/api/dashboard/roles/v1", method); return authorization.allowed ? {} : { response: Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 }) }; }
const clean = (input: Record<string, Partial<Permission>> | undefined, sidebars: Sidebar[]) => Object.fromEntries(sidebars.map((item) => [item.id, { read: Boolean(input?.[item.id]?.read), create: Boolean(input?.[item.id]?.create), update: Boolean(input?.[item.id]?.update), delete: Boolean(input?.[item.id]?.delete) }])) as Record<string, Permission>;
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const guard = await allowed(request, "PATCH"); if (guard.response) return guard.response; const { id } = await params; const body = await request.json().catch(() => null) as Partial<Role> | null; const name = body?.name?.trim(); if (!name) return Response.json({ error: "Role name is required." }, { status: 400 }); const database = client.db(); const sidebars = await database.collection<Sidebar>("sidebar").find({}, { projection: { id: 1 } }).toArray(); const result = await database.collection<Role>("role").updateOne({ id }, { $set: { name, responsible: body?.responsible?.trim() || "", icon: body?.icon?.trim() || "ShieldCheck", position: typeof body?.position === "number" ? body.position : 0, permissions: clean(body?.permissions, sidebars), updatedAt: new Date() } }); if (!result.matchedCount) return Response.json({ error: "Role not found." }, { status: 404 }); await invalidateDashboardCache(redisKeys.roles, redisKeys.access); return Response.json({ success: true }); }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { const guard = await allowed(request, "DELETE"); if (guard.response) return guard.response; const { id } = await params; const result = await client.db().collection("role").deleteOne({ id }); if (!result.deletedCount) return Response.json({ error: "Role not found." }, { status: 404 }); await invalidateDashboardCache(redisKeys.roles, redisKeys.access); return Response.json({ success: true }); }
