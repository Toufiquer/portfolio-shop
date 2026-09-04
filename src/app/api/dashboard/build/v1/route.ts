/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 15 August 2026
|-----------------------------------------
*/
import { revalidatePath, revalidateTag } from "next/cache";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest } from "@/app/api/lib/dashboard-authorization";

const COOLDOWN_MS = 3 * 60_000;
type BuildRecord = { key: string; cooldownUntil: Date; updatedAt: Date };
export type BuildTarget =
  "all" | "topbanner" | "menu" | "footer" | "whatsapp" | "user-navigation" | "dashboard-navigation" | `page:${string}`;
export type BuildItem = { id: BuildTarget; name: string; path?: string; kind: "component" | "page" };
const codedPagePaths: Array<[string, string]> = [
  ["/", "Home"],
  ["/forgot-password", "Forgot Password"],
  ["/login", "Login"],
  ["/registration", "Registration"],
];
const codedPages: BuildItem[] = codedPagePaths.map(([path, name]) => ({
  id: `page:${path}` as BuildTarget,
  name,
  path,
  kind: "page",
}));
const isExcludedBuildPath = (path: string) =>
  path === "/login" ||
  path === "/registration" ||
  path === "/forgot-password" ||
  path.startsWith("/forgot-password/") ||
  path === "/dashboard" ||
  path.startsWith("/dashboard/") ||
  path === "/tools" ||
  path.startsWith("/tools/");
const collection = () => client.db().collection<BuildRecord>("build_revalidation");
const access = async (request: Request) => {
  const limited = rateLimit(request, "dashboard-build-api", 10, 60_000);
  return { limited, session: limited ? null : await auth.api.getSession({ headers: request.headers }) };
};
const response = (cooldowns: Record<string, string | null> = {}, count = 0, items: BuildItem[] = []) => ({
  cooldowns,
  count,
  items,
});
async function itemsAndPaths() {
  const dynamic = await client
    .db()
    .collection<{ path: string; title?: string }>("pages")
    .find({}, { projection: { path: 1, title: 1 } })
    .toArray();
  const components: BuildItem[] = [
    { id: "topbanner", name: "Top banner", kind: "component" },
    { id: "menu", name: "Menu", kind: "component" },
    { id: "footer", name: "Footer", kind: "component" },
    { id: "whatsapp", name: "WhatsApp", kind: "component" },
    { id: "user-navigation", name: "User Navigation", kind: "component" },
    { id: "dashboard-navigation", name: "Dashboard Navigation", kind: "component" },
  ];
  const dynamicItems = dynamic
    .filter((page) => page.path && !isExcludedBuildPath(page.path))
    .map((page) => ({
      id: `page:${page.path}` as BuildTarget,
      name: page.title || page.path,
      path: page.path,
      kind: "page" as const,
    }));
  return [...new Map([...components, ...codedPages, ...dynamicItems].map((item) => [item.id, item])).values()];
}
async function authorized(request: Request, method: "GET" | "POST") {
  const { limited, session } = await access(request);
  if (limited) return { error: limited };
  if (!session) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };
  const permission = await authorizeDashboardRequest(session, "/dashboard/admin/build", method);
  return permission.allowed
    ? { session }
    : { error: Response.json({ error: permission.state.message ?? "Unauthorized." }, { status: 403 }) };
}
export async function GET(request: Request) {
  const result = await authorized(request, "GET");
  if ("error" in result) return result.error;
  const items = await itemsAndPaths();
  const records = await collection()
    .find({ key: { $in: [...items.map((item) => item.id), "all"] } })
    .toArray();
  return Response.json(
    response(Object.fromEntries(records.map((record) => [record.key, record.cooldownUntil.toISOString()])), 0, items),
  );
}
export async function POST(request: Request) {
  const result = await authorized(request, "POST");
  if ("error" in result) return result.error;
  const body = (await request.json().catch(() => null)) as { target?: BuildTarget } | null;
  const target = body?.target ?? "all";
  const items = await itemsAndPaths();
  const byId = new Map(items.map((item) => [item.id, item]));
  if (target !== "all" && !byId.has(target))
    return Response.json({ error: "Invalid revalidation target." }, { status: 400 });
  const targets = target === "all" ? items.map((item) => item.id) : [target];
  const now = new Date();
  const existing = await collection().findOne({ key: target });
  if (existing?.cooldownUntil && existing.cooldownUntil > now)
    return Response.json(
      { error: "This item is cooling down.", cooldowns: { [target]: existing.cooldownUntil.toISOString() } },
      { status: 429 },
    );
  let count = 0;
  if (target === "all" || ["topbanner", "menu", "footer", "whatsapp"].includes(target)) {
    revalidatePath("/", "layout");
    count += 1;
  }
  if (target === "all" || target === "user-navigation" || target === "dashboard-navigation") {
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/developer/navigation");
    count += 1;
  }
  if (target === "all") {
    revalidatePath("/", "page");
    revalidatePath("/dashboard", "layout");
    items.filter((item) => item.kind === "page" && item.path).forEach((item) => revalidatePath(item.path!));
    count += items.filter((item) => item.kind === "page").length;
  }
  if (target.startsWith("page:")) {
    revalidatePath(target.slice(5));
    count += 1;
  }
  revalidateTag("site-pages", "max");
  const cooldownUntil = new Date(Date.now() + COOLDOWN_MS);
  const cooldownKeys = target === "all" ? ["all", ...targets] : targets;
  await collection().bulkWrite(
    cooldownKeys.map((key) => ({
      updateOne: { filter: { key }, update: { $set: { key, cooldownUntil, updatedAt: now } }, upsert: true },
    })),
  );
  return Response.json(
    response(Object.fromEntries(cooldownKeys.map((key) => [key, cooldownUntil.toISOString()])), count),
  );
}
