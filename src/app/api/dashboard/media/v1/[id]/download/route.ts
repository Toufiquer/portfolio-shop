/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 16 August 2026
|-----------------------------------------
*/

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, getDashboardAccessState } from "@/app/api/lib/dashboard-authorization";

import type { Media } from "../../route";

const media = () => client.db().collection<Media>("media");
const isAdministrator = (roleName: string | null) => /^(admin|super admin)$/i.test(roleName?.trim() ?? "");
const isDownloadableHost = (hostname: string, provider: Media["uploadPlane"]) => {
  const host = hostname.toLowerCase();
  return provider === "imageBB"
    ? host === "i.ibb.co" || host.endsWith(".ibb.co")
    : provider === "Uploadthings" &&
        (host === "utfs.io" ||
          host.endsWith(".utfs.io") ||
          host.endsWith(".ufs.sh") ||
          host.endsWith(".uploadthing.com"));
};
const mimeTypeFor = (type: Media["type"]) =>
  ({
    picture: "application/octet-stream",
    video: "video/mp4",
    audio: "audio/mpeg",
    zip: "application/zip",
    doc: "application/octet-stream",
    pdf: "application/pdf",
    txt: "text/plain; charset=utf-8",
  })[type];
const safeFileName = (name: string) => name.replace(/[\\/:*?"<>|\r\n]+/g, "_").trim() || "media";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "media-download-api");
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const authorization = await authorizeDashboardRequest(session, new URL(request.url).pathname, "GET");
  if (!authorization.allowed)
    return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });

  const { id } = await params;
  const item = await media().findOne({ id });
  if (!item) return Response.json({ error: "Media not found." }, { status: 404 });
  if (item.uploadPlane === "Youtube")
    return Response.json({ error: "YouTube videos cannot be downloaded." }, { status: 400 });

  const access = await getDashboardAccessState(session);
  if (!isAdministrator(access.roleName) && item.author !== session.user.email.trim().toLowerCase())
    return Response.json({ error: "You can only download your own media." }, { status: 403 });

  let source: URL;
  try {
    source = new URL(item.url);
  } catch {
    return Response.json({ error: "This media has an invalid download URL." }, { status: 422 });
  }
  if (source.protocol !== "https:" || !isDownloadableHost(source.hostname, item.uploadPlane))
    return Response.json({ error: "This media source cannot be downloaded." }, { status: 422 });

  try {
    const upstream = await fetch(source);
    if (!upstream.ok || !upstream.body)
      return Response.json({ error: "The media file is currently unavailable." }, { status: 502 });
    const fileName = safeFileName(item.name);
    const asciiFileName = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "_");
    const encodedFileName = encodeURIComponent(fileName).replace(
      /[!'()*]/g,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    return new Response(upstream.body, {
      headers: {
        "Content-Disposition": `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`,
        "Content-Type": upstream.headers.get("content-type") ?? mimeTypeFor(item.type),
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
      },
    });
  } catch {
    return Response.json({ error: "Could not download the media file." }, { status: 502 });
  }
}
