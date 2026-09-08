/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { revalidatePath, revalidateTag } from "next/cache";

import { rateLimit } from "@/app/api/lib/api-rate-limit";
import { auth, client } from "@/app/api/lib/auth";
import { authorizeDashboardRequest, canAccessMaintenanceTools } from "@/app/api/lib/dashboard-authorization";
import { invalidateDashboardCache, redisKeys } from "@/app/api/lib/redis";
import { pageDefaults, sidebarDefaults, type ImportPageVariant } from "@/app/tools/import-data/defaults";

type SidebarItem = {
  id: string;
  name: string;
  url: string;
  icon: string;
  parentId: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};
type SavedSidebar = Pick<SidebarItem, "id" | "name" | "url" | "icon" | "parentId" | "position">;
type SitePage = {
  id: string;
  title: string;
  path: string;
  description: string;
  published: boolean;
  blocks: {
    id: string;
    type: "all-page";
    variant: ImportPageVariant | "all-about" | "all-contact" | "all-faq";
    data: Record<string, string>;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

const defaults = sidebarDefaults;
const defaultPages = pageDefaults;
/*
  {
    name: "Developer",
    url: "/dashboard/developer",
    icon: "Wrench",
    children: [
      { name: "Account", url: "/dashboard/developer/account", icon: "CreditCard" },
      { name: "Session", url: "/dashboard/developer/session", icon: "Lock" },
      { name: "Verification", url: "/dashboard/developer/verification", icon: "ShieldCheck" },
      { name: "Sidebar", url: "/dashboard/developer/sidebar", icon: "Menu" },
      { name: "Users", url: "/dashboard/developer/users", icon: "Users" },
    ],
  },
  {
    name: "Admin",
    url: "/dashboard/Admin",
    icon: "Settings",
    children: [
      { name: "Access", url: "/dashboard/admin/access", icon: "Lock" },
      { name: "Users", url: "/dashboard/admin/users", icon: "Users" },
      { name: "Role", url: "/dashboard/admin/role", icon: "ShieldCheck" },
      { name: "Footer", url: "/dashboard/admin/footer", icon: "FileText" },
      { name: "Install", url: "/dashboard/install", icon: "Download" },
      { name: "Menu", url: "/dashboard/admin/menu", icon: "Menu" },
      { name: "Build", url: "/dashboard/admin/build", icon: "RefreshCw" },
      { name: "Top Banner", url: "/dashboard/admin/topbanner", icon: "FileBadge" },
      { name: "Tracking", url: "/dashboard/admin/tracking", icon: "Activity" },
    ],
  },
  { name: "Media", url: "/dashboard/media", icon: "Image" },
  { name: "WhatsApp", url: "/dashboard/admin/whatsapp", icon: "MessageCircle" },
  { name: "Profile", url: "/dashboard/profile", icon: "User" },
  { name: "Install", url: "/dashboard/install", icon: "Download" },
];
const defaultPages: DefaultPage[] = [
  { title: "Home", path: "/home", description: "A flexible home page.", variant: "all-home" },
  { title: "About us", path: "/about-us", description: "Learn about our team and purpose.", variant: "all-about-us" },
  { title: "Contact us", path: "/contact-us", description: "Contact details, map, and message form.", variant: "all-contact-us" },
  { title: "Frequently Asked Questions", path: "/frequently-ask-questions", description: "Answers to frequently asked questions.", variant: "all-frequently-ask-questions" },
  { title: "Privacy Policy", path: "/privacy-policy", description: "Our privacy policy.", variant: "all-privacy" },
  { title: "Refund Policy", path: "/refund-policy", description: "Our refund policy.", variant: "all-refund" },
  { title: "Terms and Conditions", path: "/terms-and-condition", description: "Our terms and conditions.", variant: "all-terms" },
];
*/

export async function POST(request: Request) {
  const limited = rateLimit(request, "import-sidebar-api", 10, 60_000);
  if (limited) return limited;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!canAccessMaintenanceTools(session)) {
    const authorization = await authorizeDashboardRequest(session, "/dashboard/developer/sidebar", "POST");
    if (!authorization.allowed)
      return Response.json({ error: authorization.state.message ?? "Unauthorized." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { target?: "all" | "sidebar" | "pages" } | null;
  const target = body?.target ?? "all";
  const collection = client.db().collection<SidebarItem>("sidebar");
  const existing: SavedSidebar[] =
    target === "pages"
      ? []
      : await collection
          .find({}, { projection: { id: 1, name: 1, url: 1, icon: 1, parentId: 1, position: 1 } })
          .toArray();
  const itemsByUrl = new Map(existing.map((item) => [item.url, item]));

  // Older defaults used a capitalized Admin route. Reuse that record so a
  // one-click import does not leave a duplicate Admin group behind.
  const legacyAdmin = itemsByUrl.get("/dashboard/Admin");
  if (target !== "pages" && legacyAdmin && !itemsByUrl.has("/dashboard/admin")) {
    await collection.updateOne({ id: legacyAdmin.id }, { $set: { url: "/dashboard/admin", updatedAt: new Date() } });
    legacyAdmin.url = "/dashboard/admin";
    itemsByUrl.delete("/dashboard/Admin");
    itemsByUrl.set(legacyAdmin.url, legacyAdmin);
  }
  // Preserve the existing sidebar record (and its role permissions) when the
  // customer-management feature is renamed to Business Growth.
  const legacyCustomer = itemsByUrl.get("/dashboard/admin/customer");
  if (target !== "pages" && legacyCustomer && !itemsByUrl.has("/dashboard/admin/business-growth")) {
    await collection.updateOne(
      { id: legacyCustomer.id },
      { $set: { url: "/dashboard/admin/business-growth", updatedAt: new Date() } },
    );
    legacyCustomer.url = "/dashboard/admin/business-growth";
    itemsByUrl.delete("/dashboard/admin/customer");
    itemsByUrl.set(legacyCustomer.url, legacyCustomer);
  }
  let inserted = 0;
  let updated = 0;

  if (target !== "pages")
    for (let parentPosition = 0; parentPosition < defaults.length; parentPosition += 1) {
      const parent = defaults[parentPosition];
      let savedParent = itemsByUrl.get(parent.url);
      if (!savedParent) {
        const item: SidebarItem = {
          id: randomUUID(),
          name: parent.name,
          url: parent.url,
          icon: parent.icon,
          parentId: null,
          position: parentPosition,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await collection.insertOne(item);
        savedParent = item;
        itemsByUrl.set(parent.url, savedParent);
        inserted += 1;
      } else {
        const changes = {
          name: parent.name,
          icon: parent.icon,
          parentId: null,
          position: parentPosition,
          updatedAt: new Date(),
        };
        if (
          savedParent.name !== changes.name ||
          savedParent.icon !== changes.icon ||
          savedParent.parentId !== changes.parentId ||
          savedParent.position !== changes.position
        ) {
          await collection.updateOne({ id: savedParent.id }, { $set: changes });
          Object.assign(savedParent, changes);
          updated += 1;
        }
      }

      for (let childPosition = 0; childPosition < (parent.children?.length ?? 0); childPosition += 1) {
        const child = parent.children![childPosition];
        const savedChild = itemsByUrl.get(child.url);
        if (!savedChild) {
          const item: SidebarItem = {
            id: randomUUID(),
            name: child.name,
            url: child.url,
            icon: child.icon,
            parentId: savedParent.id,
            position: childPosition,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await collection.insertOne(item);
          itemsByUrl.set(child.url, item);
          inserted += 1;
        } else {
          const changes = {
            name: child.name,
            icon: child.icon,
            parentId: savedParent.id,
            position: childPosition,
            updatedAt: new Date(),
          };
          if (
            savedChild.name !== changes.name ||
            savedChild.icon !== changes.icon ||
            savedChild.parentId !== changes.parentId ||
            savedChild.position !== changes.position
          ) {
            await collection.updateOne({ id: savedChild.id }, { $set: changes });
            Object.assign(savedChild, changes);
            updated += 1;
          }
        }
      }
    }

  let pagesInserted = 0;
  let pagesUpdated = 0;
  if (target !== "sidebar") {
    const pageCollection = client.db().collection<SitePage>("pages");
    const faqMigration = await pageCollection.updateMany(
      { "blocks.variant": "all-faq" },
      { $set: { "blocks.$[block].variant": "all-frequently-ask-questions", updatedAt: new Date() } },
      { arrayFilters: [{ "block.variant": "all-faq" }] },
    );
    pagesUpdated += faqMigration.modifiedCount;
    const aboutMigration = await pageCollection.updateMany(
      { "blocks.variant": "all-about" },
      { $set: { "blocks.$[block].variant": "all-about-us", updatedAt: new Date() } },
      { arrayFilters: [{ "block.variant": "all-about" }] },
    );
    const contactMigration = await pageCollection.updateMany(
      { "blocks.variant": "all-contact" },
      { $set: { "blocks.$[block].variant": "all-contact-us", updatedAt: new Date() } },
      { arrayFilters: [{ "block.variant": "all-contact" }] },
    );
    pagesUpdated += aboutMigration.modifiedCount + contactMigration.modifiedCount;
    const existingPaths = new Set(
      (await pageCollection.find({}, { projection: { path: 1 } }).toArray()).map((page) => page.path),
    );
    if (!existingPaths.has("/") && existingPaths.has("/home")) {
      await pageCollection.updateOne({ path: "/home" }, { $set: { path: "/", title: "Home", updatedAt: new Date() } });
      existingPaths.delete("/home");
      existingPaths.add("/");
      pagesUpdated += 1;
      revalidatePath("/");
    }
    for (const page of defaultPages) {
      if (existingPaths.has(page.path)) continue;
      const now = new Date();
      await pageCollection.insertOne({
        id: randomUUID(),
        title: page.title,
        path: page.path,
        description: page.description,
        published: true,
        blocks: [{ id: randomUUID(), type: "all-page", variant: page.variant, data: {} }],
        createdAt: now,
        updatedAt: now,
      });
      pagesInserted += 1;
      revalidatePath(page.path);
    }
    if (pagesInserted) {
      revalidatePath("/", "layout");
      revalidateTag("site-pages", "max");
    }
  }
  if (inserted || updated) await invalidateDashboardCache(redisKeys.sidebars, redisKeys.roles);
  return Response.json({ inserted, updated, pagesInserted, pagesUpdated });
}
