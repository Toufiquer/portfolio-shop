/*
|-----------------------------------------
| setting up dashboard-authorization.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { randomUUID } from "crypto";

import { client } from "@/app/api/lib/auth";
import { invalidateDashboardCache, redisKeys } from "@/app/api/lib/redis";

export type DashboardOperation = "read" | "create" | "update" | "delete";

type Permission = Record<DashboardOperation, boolean>;
type Role = { id: string; name: string; permissions: Record<string, Permission> };
type Access = {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  blocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
type Sidebar = {
  id: string;
  name?: string;
  url: string;
  icon?: string;
  parentId: string | null;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
type SessionUser = { user: { email?: string | null } };

const standardUserPaths = new Set(["/dashboard/profile", "/dashboard/media", "/dashboard/install"]);

export type DashboardAccessState = {
  bypassed: boolean;
  blocked: boolean;
  roleId: string | null;
  roleName: string | null;
  allowedSidebarIds: string[];
  message?: string;
};

export const authorizationIsDisabled = () => process.env.AuthorizationEnable === "false";

const toolApiOwners = new Set(["toufiquer.0@gmail.com", "tec.verse.bd@gmail.com"]);

function cleanEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}


// These accounts are explicitly trusted for maintenance-only tools. They must
// still have a valid Better Auth session; this is not an anonymous bypass.
export function canAccessMaintenanceTools(session: SessionUser) {
  return toolApiOwners.has(cleanEmail(session.user.email));
}

async function ensureDefaultAccess(email: string) {
  const database = client.db();
  const existing = await database.collection<Access>("access").findOne({ email });
  if (existing) return existing;

  const existingRole = await database.collection<Role>("role").findOne({ name: /^user$/i });
  const role: Role =
    existingRole ??
    (() => {
      const now = new Date();
      return { id: randomUUID(), name: "user", permissions: {}, createdAt: now, updatedAt: now };
    })();
  if (!existingRole)
    await database
      .collection("role")
      .insertOne({ ...role, responsible: "Default blocked role", icon: "ShieldOff", position: -1 });

  const now = new Date();
  const item: Access = {
    id: randomUUID(),
    email,
    roleId: role.id,
    roleName: role.name,
    blocked: false,
    createdAt: now,
    updatedAt: now,
  };
  await database.collection<Access>("access").insertOne(item);
  await invalidateDashboardCache(redisKeys.roles, redisKeys.access);
  return item;
}

async function enforceStandardUserPermissions(role: Role, sidebars: Sidebar[]) {
  if (role.name.trim().toLowerCase() !== "user") return role;

  const permissions = Object.fromEntries(
    sidebars.map((sidebar) => [
      sidebar.id,
      standardUserPaths.has(sidebar.url)
        ? { read: true, create: true, update: true, delete: true }
        : { read: false, create: false, update: false, delete: false },
    ]),
  ) as Record<string, Permission>;
  const unchanged = JSON.stringify(role.permissions ?? {}) === JSON.stringify(permissions);
  if (!unchanged) {
    await client
      .db()
      .collection<Role>("role")
      .updateOne({ id: role.id }, { $set: { permissions, updatedAt: new Date() } });
    await invalidateDashboardCache(redisKeys.roles, redisKeys.access);
  }
  return { ...role, permissions };
}

export async function getDashboardAccessState(session: SessionUser): Promise<DashboardAccessState> {
  if (authorizationIsDisabled())
    return { bypassed: true, blocked: false, roleId: null, roleName: null, allowedSidebarIds: [] };

  const email = cleanEmail(session.user.email);
  if (!email)
    return {
      bypassed: false,
      blocked: true,
      roleId: null,
      roleName: null,
      allowedSidebarIds: [],
      message: "Your account has no email address.",
    };

  const access = await ensureDefaultAccess(email);
  if (access.blocked)
    return {
      bypassed: false,
      blocked: true,
      roleId: access.roleId,
      roleName: access.roleName,
      allowedSidebarIds: [],
      message: "Your account has been blocked.",
    };

  const database = client.db();
  const [savedRole, savedSidebars] = await Promise.all([
    database.collection<Role>("role").findOne({ id: access.roleId }),
    database
      .collection<Sidebar>("sidebar")
      .find({}, { projection: { id: 1, url: 1, parentId: 1 } })
      .toArray(),
  ]);
  if (!savedRole)
    return {
      bypassed: false,
      blocked: true,
      roleId: access.roleId,
      roleName: access.roleName,
      allowedSidebarIds: [],
      message: "Your assigned role no longer exists.",
    };

  const sidebars = savedSidebars;
  const role = await enforceStandardUserPermissions(savedRole, sidebars);
  const allowed = sidebars.filter((sidebar) => role.permissions[sidebar.id]?.read).map((sidebar) => sidebar.id);
  return { bypassed: false, blocked: false, roleId: role.id, roleName: role.name, allowedSidebarIds: allowed };
}

function operationForMethod(method: string): DashboardOperation {
  if (method === "POST") return "create";
  if (method === "PATCH" || method === "PUT") return "update";
  if (method === "DELETE") return "delete";
  return "read";
}

function apiResourcePaths(pathname: string, method: string) {
  const resource = pathname.split("/")[3] ?? "";
  if (resource === "sidebars" && method === "GET") return [];
  const resources: Record<string, string[]> = {
    access: ["/dashboard/admin/access"],
    roles: ["/dashboard/admin/role", "/dashboard/developer/role"],
    sidebars: ["/dashboard/developer/sidebar"],
    accounts: ["/dashboard/admin/account", "/dashboard/developer/account"],
    sessions: ["/dashboard/developer/session"],
    verifications: ["/dashboard/developer/verification"],
    users: ["/dashboard/admin/users", "/dashboard/developer/users"],
    media: ["/dashboard/media"],
    install: ["/dashboard/install"],
    profile: ["/dashboard/profile"],
    whatsapp: ["/dashboard/admin/whatsapp", "/dashboard/whatsapp"],
    topbanner: ["/dashboard/admin/topbanner", "/dashboard/admin/top-banner"],
    footer: ["/dashboard/admin/footer", "/dashboard/admin/footer-editor"],
    menu: ["/dashboard/admin/menu"],
    pages: ["/dashboard/admin/pages"],
    build: ["/dashboard/admin/build"],
    tracking: ["/dashboard/admin/tracking"],
    navigation: ["/dashboard/developer/navigation"],
  };
  return resources[resource] ?? [];
}

function pageResourcePaths(pathname: string) {
  const aliases: Record<string, string[]> = {
    "/dashboard/admin/whatsapp": ["/dashboard/whatsapp"],
    "/dashboard/admin/topbanner": ["/dashboard/admin/top-banner"],
    "/dashboard/admin/footer": ["/dashboard/admin/footer-editor"],
  };
  // Editor, database, and preview pages inherit their parent dashboard
  // permission. This keeps direct reloads authorized just like navigating from
  // the parent list.
  const parents = [
    ...(pathname.startsWith("/dashboard/admin/menu/") ? ["/dashboard/admin/menu"] : []),
    ...(pathname.startsWith("/dashboard/admin/pages/") ? ["/dashboard/admin/pages"] : []),
  ];
  return [pathname, ...(aliases[pathname] ?? []), ...parents];
}

export function isPublicDashboardRead(pathname: string, method: string) {
  return (
    method === "GET" &&
    [
      "/api/dashboard/topbanner/v1",
      "/api/dashboard/footer/v1",
      "/api/dashboard/menu/v1",
      "/api/dashboard/navigation/v1",
    ].includes(pathname)
  );
}

export async function authorizeDashboardRequest(session: SessionUser, pathname: string, method: string) {
  const state = await getDashboardAccessState(session);
  if (state.bypassed) return { allowed: true, state };
  if (state.blocked) return { allowed: false, state };

  // The dashboard home is not an editable sidebar row. A role that can read at
  // least one sidebar area may enter it; a default "user" role still cannot.
  if (pathname === "/dashboard" && method === "GET") {
    const allowed = state.allowedSidebarIds.length > 0;
    return {
      allowed,
      state: allowed ? state : { ...state, message: "Your role has no dashboard permissions yet." },
    };
  }

  const paths = pathname.startsWith("/api/dashboard/")
    ? apiResourcePaths(pathname, method)
    : pageResourcePaths(pathname);
  if (!paths.length) return { allowed: true, state };

  if (!state.roleId) return { allowed: false, state: { ...state, message: "Your role is unavailable." } };
  const role = await client.db().collection<Role>("role").findOne({ id: state.roleId });
  const sidebars = await client
    .db()
    .collection<Sidebar>("sidebar")
    .find({ url: { $in: paths } }, { projection: { id: 1, url: 1 } })
    .toArray();
  const operation = operationForMethod(method);
  const allowed = sidebars.some((sidebar) => Boolean(role?.permissions[sidebar.id]?.[operation]));
  return {
    allowed,
    state: allowed ? state : { ...state, message: `You do not have ${operation} permission for this area.` },
  };
}
