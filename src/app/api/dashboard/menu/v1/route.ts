/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Speed Box, August, 2026
|-----------------------------------------
*/

import { revalidatePath } from "next/cache";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";
import { defaultMenuOne, defaultMenuThree, defaultMenuTwo, type MenuData } from "@/app/dashboard/admin/menu/data";

type MenuId = MenuData["variant"];
type MenuRecord = { key: string; variant: MenuId; data: Record<string, unknown>; position?: number; updatedAt?: Date };
const ids: MenuId[] = ["menu-1", "menu-2", "menu-3"];
const defaults: Record<MenuId, MenuData> = { "menu-1": defaultMenuOne, "menu-2": defaultMenuTwo, "menu-3": defaultMenuThree };
const collection = () => client.db().collection<MenuRecord>("menu");
const isMenuId = (value: unknown): value is MenuId => typeof value === "string" && ids.includes(value as MenuId);
const serialize = (item: MenuRecord) => ({
  menuItem: item.key,
  variant: item.variant,
  position: item.position ?? 0,
  data: { ...defaults[item.variant], ...item.data, variant: item.variant },
});

async function access(request: Request, method: "GET" | "POST" | "DELETE") {
  const limited = rateLimit(request, "dashboard-menu-api", 30, 60_000);
  if (limited) return { error: limited, session: null };
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session && method === "GET") return { session: null };
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }), session: null };
  // Every menu read is authenticated and rate-limited. Editing remains guarded
  // by the assigned dashboard role below, but a signed-in editor can safely
  // reload an existing menu without an outdated sidebar permission blocking it.
  if (method === "GET") return { session };
  const authorization = await authorizeDashboardRequest(session, "/dashboard/admin/menu", method);
  if (!authorization.allowed)
    return { error: Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 }), session };
  return { session };
}

async function savedMenus() {
  const records = await collection().find({ key: { $ne: "site" }, variant: { $in: ids } }).sort({ position: 1, updatedAt: -1 }).toArray();
  if (records.length) return records;
  const legacy = await collection().findOne({ key: "site" });
  return legacy ? [{ ...legacy, key: legacy.variant }] : [];
}

export async function GET(request: Request) {
  const { error, session } = await access(request, "GET");
  if (error) return error;
  const menus = (await savedMenus()).map(serialize);
  const published = menus.find((menu) => menu.data.isVisible) ?? null;
  if (!session) return Response.json({ menu: published });
  return Response.json({ menus, defaults: ids.map((id) => ({ menuItem: id, data: defaults[id] })) });
}

export async function POST(request: Request) {
  const { error, session } = await access(request, "POST");
  if (error || !session) return error ?? Response.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { menuItem?: unknown; data?: unknown; order?: unknown } | null;
  if (body && Array.isArray(body.order)) {
    const order = body.order as { menuItem?: unknown; position?: unknown }[];
    if (!order.length || order.some((item) => typeof item.menuItem !== "string" || !item.menuItem || !Number.isInteger(item.position) || (item.position as number) < 0))
      return Response.json({ error: "Invalid menu order." }, { status: 400 });
    await Promise.all(order.map((item) => collection().updateOne({ key: item.menuItem as string, variant: { $in: ids } }, { $set: { position: item.position as number } })));
    revalidatePath("/dashboard/admin/menu");
    return Response.json({ menus: (await savedMenus()).map(serialize) });
  }
  if (!body || typeof body.menuItem !== "string" || !body.menuItem || body.menuItem === "site" || !body.data || typeof body.data !== "object" || Array.isArray(body.data))
    return Response.json({ error: "Invalid menu data." }, { status: 400 });
  const requestedData = body.data as Record<string, unknown>;
  if (!isMenuId(requestedData.variant)) return Response.json({ error: "Invalid menu design." }, { status: 400 });
  const data: Record<string, unknown> = { ...requestedData, variant: requestedData.variant };
  // Publishing is a collection-wide state transition: the selected record is
  // the only published menu and every other (including a legacy singleton)
  // becomes Draft before the selected record is saved as Publish.
  if (data.isVisible === true)
    await collection().updateMany({ key: { $ne: body.menuItem }, variant: { $in: ids } }, { $set: { "data.isVisible": false } });
  const previous = await collection().findOne({ key: body.menuItem });
  const item: MenuRecord = { key: body.menuItem, variant: requestedData.variant, data, position: previous?.position ?? (await collection().countDocuments({ variant: { $in: ids } })), updatedAt: new Date() };
  await collection().updateOne({ key: body.menuItem }, { $set: item }, { upsert: true });
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/menu");
  return Response.json({ menu: serialize(item) });
}

export async function DELETE(request: Request) {
  const { error, session } = await access(request, "DELETE");
  if (error || !session) return error ?? Response.json({ error: "Sign in required." }, { status: 401 });
  const menuItem = new URL(request.url).searchParams.get("menuItem");
  if (!menuItem || menuItem === "site") return Response.json({ error: "Invalid menu item." }, { status: 400 });
  await collection().deleteOne({ key: menuItem });
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/menu");
  return Response.json({ menuItem });
}
