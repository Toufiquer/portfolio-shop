/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { UTApi } from "uploadthing/server";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";

import type { Media } from "../route";

const media = () => client.db().collection<Media>("media");
const isAdministrator = (roleName: string | null) => /^(admin|super admin)$/i.test(roleName?.trim() ?? "");
const canManage = async (session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>, item: Media) => {
  const access = await getDashboardAccessState(session);
  return isAdministrator(access.roleName) || item.author === session.user.email.trim().toLowerCase();
};

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "media-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, new URL(request.url).pathname, "DELETE");
  if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const item = await media().findOne({ id });
  if (!item) return Response.json({ error: "Media not found." }, { status: 404 });
  if (!(await canManage(session, item)))
    return Response.json({ error: "You can only delete your own media." }, { status: 403 });
  try {
    if (item.uploadPlane === "imageBB" && item.deleteUrl) {
      const response = await fetch(item.deleteUrl);
      if (!response.ok) throw new Error("ImageBB could not delete the remote image.");
    }
    if (item.uploadPlane === "Uploadthings" && !item.fileKey)
      throw new Error("This UploadThing media item has no file key, so it cannot be safely deleted.");
    if (item.uploadPlane === "Uploadthings" && item.fileKey) {
      const result = await new UTApi({ token: process.env.UPLOADTHING_TOKEN }).deleteFiles(item.fileKey);
      if (!result.success) throw new Error("UploadThing could not delete the remote file.");
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not delete the remote file." },
      { status: 502 },
    );
  }
  await media().deleteOne({ id });
  return Response.json({ success: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "media-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, new URL(request.url).pathname, "PATCH");
  if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  const item = await media().findOne({ id });
  if (!item) return Response.json({ error: "Media not found." }, { status: 404 });
  if (!(await canManage(session, item)))
    return Response.json({ error: "You can only edit your own media." }, { status: 403 });
  await media().updateOne({ id }, { $set: { name } });
  return Response.json({ success: true });
}
