/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 16 August 2026
|-----------------------------------------
*/

import { UTApi } from "uploadthing/server";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";

import type { Media } from "../route";

const isAdministrator = (roleName: string | null) => /^(admin|super admin)$/i.test(roleName?.trim() ?? "");
export async function DELETE(request: Request) {
  const limited = rateLimit(request, "media-api"); if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers }); if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/media/v1/bulk", "DELETE"); if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = await request.json().catch(() => null) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 100))] : [];
  if (!ids.length) return Response.json({ error: "Choose at least one media item." }, { status: 400 });
  const access = await getDashboardAccessState(session); const owner = session.user.email.trim().toLowerCase();
  const query = isAdministrator(access.roleName) ? { id: { $in: ids } } : { id: { $in: ids }, author: owner };
  const collection = client.db().collection<Media>("media"); const items = await collection.find(query).toArray();
  if (items.length !== ids.length) return Response.json({ error: "One or more media items could not be deleted." }, { status: 403 });
  try {
    for (const item of items) {
      if (item.uploadPlane === "imageBB" && item.deleteUrl) { const response = await fetch(item.deleteUrl); if (!response.ok) throw new Error("ImageBB could not delete a remote image."); }
      if (item.uploadPlane === "Uploadthings" && !item.fileKey) throw new Error("An UploadThing media item has no file key, so it cannot be safely deleted.");
      if (item.uploadPlane === "Uploadthings" && item.fileKey) { const result = await new UTApi({ token: process.env.UPLOADTHING_TOKEN }).deleteFiles(item.fileKey); if (!result.success) throw new Error("UploadThing could not delete a remote file."); }
    }
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Could not delete a remote file." }, { status: 502 }); }
  const result = await collection.deleteMany({ id: { $in: ids } });
  return Response.json({ success: true, deletedCount: result.deletedCount });
}
