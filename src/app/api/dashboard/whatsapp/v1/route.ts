/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { revalidatePath } from "next/cache";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";

const paddings = ["0", "small", "medium", "large", "extra-large", "xxl"] as const;
const positions = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
type Padding = (typeof paddings)[number];
type Position = (typeof positions)[number];
type WhatsAppSettings = {
  key: "site";
  number: string;
  padding?: Padding;
  paddingX?: Padding;
  paddingY?: Padding;
  marginX?: Padding;
  marginY?: Padding;
  position: Position;
  defaultMessage: string;
  isVisible: boolean;
  desktopTextVisible: boolean;
  updatedAt: Date;
};

const defaults = {
  number: "",
  paddingX: "medium" as Padding,
  paddingY: "medium" as Padding,
  marginX: "0" as Padding,
  marginY: "0" as Padding,
  position: "bottom-right" as Position,
  defaultMessage: "",
  isVisible: true,
  desktopTextVisible: true,
};
const collection = () => client.db().collection<WhatsAppSettings>("whatsappSettings");
const serialize = (settings: Partial<WhatsAppSettings>) => ({
  number: settings.number ?? defaults.number,
  paddingX: settings.paddingX ?? settings.padding ?? defaults.paddingX,
  paddingY: settings.paddingY ?? settings.padding ?? defaults.paddingY,
  marginX: settings.marginX ?? defaults.marginX,
  marginY: settings.marginY ?? defaults.marginY,
  position: settings.position ?? defaults.position,
  defaultMessage: settings.defaultMessage ?? defaults.defaultMessage,
  isVisible: settings.isVisible ?? defaults.isVisible,
  desktopTextVisible: settings.desktopTextVisible ?? defaults.desktopTextVisible,
});

async function access(request: Request, method: "GET" | "PATCH") {
  const limited = rateLimit(request, "dashboard-whatsapp-api", 30, 60_000);
  if (limited) return { error: limited };

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };

  const authorization = await authorizeDashboardRequest(session, "/dashboard/admin/whatsapp", method);
  if (!authorization.allowed)
    return { error: Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 }) };

  return {};
}

export async function GET(request: Request) {
  const result = await access(request, "GET");
  if ("error" in result) return result.error;
  return Response.json({ settings: serialize((await collection().findOne({ key: "site" })) ?? {}) });
}

export async function PATCH(request: Request) {
  const result = await access(request, "PATCH");
  if ("error" in result) return result.error;

  const body = (await request.json().catch(() => null)) as Partial<WhatsAppSettings> | null;
  const number = body?.number?.trim().replace(/[^+\d]/g, "") ?? "";
  const defaultMessage = body?.defaultMessage?.trim() ?? "";
  if (number && !/^\+?\d{7,15}$/.test(number))
    return Response.json({ error: "Enter a valid WhatsApp number." }, { status: 400 });
  if (
    !paddings.includes(body?.paddingX as Padding) ||
    !paddings.includes(body?.paddingY as Padding) ||
    !paddings.includes(body?.marginX as Padding) ||
    !paddings.includes(body?.marginY as Padding) ||
    !positions.includes(body?.position as Position) ||
    typeof body?.isVisible !== "boolean" ||
    typeof body?.desktopTextVisible !== "boolean"
  )
    return Response.json({ error: "Invalid WhatsApp settings." }, { status: 400 });

  const settings = {
    key: "site" as const,
    number,
    paddingX: body.paddingX as Padding,
    paddingY: body.paddingY as Padding,
    marginX: body.marginX as Padding,
    marginY: body.marginY as Padding,
    position: body.position as Position,
    defaultMessage: defaultMessage.slice(0, 1000),
    isVisible: body.isVisible,
    desktopTextVisible: body.desktopTextVisible,
    updatedAt: new Date(),
  };
  await collection().updateOne({ key: "site" }, { $set: settings }, { upsert: true });
  revalidatePath("/", "layout");
  return Response.json({ settings: serialize(settings) });
}
