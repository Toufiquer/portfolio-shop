/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";

export type Media = {
  id: string;
  name: string;
  author: string;
  url: string;
  uploadPlane: "imageBB" | "Youtube" | "Uploadthings";
  type: "picture" | "video" | "audio" | "zip" | "doc" | "pdf" | "txt";
  deleteUrl?: string;
  fileKey?: string;
  createdAt: Date;
};
type UploadOwnership = { fileKey: string; url: string; author: string };
const uploadPlanes = new Set<Media["uploadPlane"]>(["imageBB", "Youtube", "Uploadthings"]);
const mediaTypes = new Set<Media["type"]>(["picture", "video", "audio", "zip", "doc", "pdf", "txt"]);
const youtubeUrl =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}(?:[?&/#].*)?$/i;
const serialize = (item: Media) => ({ ...item, createdAt: new Date(item.createdAt).toISOString() });
const isAdministrator = (roleName: string | null) => /^(admin|super admin)$/i.test(roleName?.trim() ?? "");
const cleanEmail = (email: string) => email.trim().toLowerCase();

export async function GET(request: Request) {
  const limited = rateLimit(request, "media-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/media/v1", "GET");
  if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const access = await getDashboardAccessState(session);
  const ownerOnly = !isAdministrator(access.roleName);
  const items = await client
    .db()
    .collection<Media>("media")
    .find(ownerOnly ? { author: cleanEmail(session.user.email) } : {})
    .sort({ createdAt: -1 })
    .toArray();
  return Response.json({ items: items.map(serialize) });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "media-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, "/api/dashboard/media/v1", "POST");
  if (!authorization.allowed) return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as Partial<Media> | null;
  if (
    !body?.name?.trim() ||
    !body.url?.trim() ||
    !body.uploadPlane ||
    !body.type ||
    !uploadPlanes.has(body.uploadPlane) ||
    !mediaTypes.has(body.type)
  )
    return Response.json({ error: "Valid media details are required." }, { status: 400 });
  if (body.uploadPlane === "Youtube" && !youtubeUrl.test(body.url.trim()))
    return Response.json({ error: "A valid YouTube URL is required." }, { status: 400 });
  if (body.uploadPlane === "imageBB" && body.type !== "picture")
    return Response.json({ error: "ImageBB media must be an image." }, { status: 400 });
  const database = client.db();
  const author = cleanEmail(session.user.email);
  if (body.uploadPlane === "Uploadthings") {
    const fileKey = body.fileKey?.trim();
    if (!fileKey) return Response.json({ error: "UploadThing file details are required." }, { status: 400 });
    const upload = await database
      .collection<UploadOwnership>("uploadthing_uploads")
      .findOne({ fileKey, url: body.url.trim(), author });
    if (!upload)
      return Response.json({ error: "This UploadThing file was not uploaded by your account." }, { status: 403 });
    if (await database.collection<Media>("media").findOne({ fileKey }))
      return Response.json({ error: "This UploadThing file is already in the media library." }, { status: 409 });
  }
  const item: Media = {
    id: randomUUID(),
    name: body.name.trim(),
    author,
    url: body.url.trim(),
    uploadPlane: body.uploadPlane,
    type: body.type,
    createdAt: new Date(),
    ...(body.uploadPlane === "imageBB" && typeof body.deleteUrl === "string" ? { deleteUrl: body.deleteUrl } : {}),
    ...(body.uploadPlane === "Uploadthings" && typeof body.fileKey === "string" ? { fileKey: body.fileKey } : {}),
  };
  await database.collection<Media>("media").insertOne(item);
  return Response.json({ item: serialize(item) }, { status: 201 });
}
