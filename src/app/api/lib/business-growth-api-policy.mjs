/*
|-----------------------------------------
| Business Growth API authorization policy
|-----------------------------------------
*/

const areas = new Set(["workspace", "overview", "funnels", "councilors", "customers", "tasks", "spends"]);
const pageForArea = {
  overview: "/dashboard/business-growth/overview",
  funnels: "/dashboard/business-growth/funnels",
  councilors: "/dashboard/business-growth/councillor",
  customers: "/dashboard/business-growth/customer",
  tasks: "/dashboard/business-growth/my-customer",
};

export function isBusinessGrowthAdministratorRole(roleName) {
  return /^(admin|administrator|super admin|super administrator|developer)$/i.test(roleName?.trim() ?? "");
}

export function isBusinessGrowthCouncilorRole(roleName) {
  return /^(councilor|councillor)$/i.test(roleName?.trim() ?? "");
}

export function authorizeCouncilorCustomerPatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, status: 400, error: "Invalid customer update." };

  const assignmentFields = ["councilorId", "councilorEmail", "reassign"];
  if (assignmentFields.some((field) => Object.hasOwn(value, field)))
    return { allowed: false, status: 403, error: "Counselors cannot assign or reassign customers." };

  const editableFields = ["customerStatus", "notes", "followUps"];
  const unexpected = Object.keys(value).filter((field) => !["id", "kind", ...editableFields].includes(field));
  if (unexpected.length)
    return {
      allowed: false,
      status: 403,
      error: "Counselors may update only customer status, notes, and follow-up data.",
    };

  const patch = {};
  if (Object.hasOwn(value, "customerStatus")) {
    if (value.customerStatus !== "active" && value.customerStatus !== "inactive")
      return { allowed: false, status: 400, error: "Invalid status." };
    patch.customerStatus = value.customerStatus;
  }
  if (Object.hasOwn(value, "notes")) {
    if (typeof value.notes !== "string" || value.notes.length > 2000)
      return { allowed: false, status: 400, error: "Notes must be 2,000 characters or fewer." };
    patch.notes = value.notes;
  }
  if (Object.hasOwn(value, "followUps")) {
    if (!Array.isArray(value.followUps) || value.followUps.length > 100)
      return { allowed: false, status: 400, error: "Follow-up data must contain at most 100 entries." };
    patch.followUps = value.followUps;
  }
  if (!Object.keys(patch).length)
    return { allowed: false, status: 400, error: "No editable customer fields supplied." };

  return { allowed: true, patch };
}

export async function authorizeBusinessGrowthPolicy(state, area, method, target, authorizeDashboard) {
  if (state.blocked) return { allowed: false, state };
  if (isBusinessGrowthCouncilorRole(state.roleName)) {
    const readAreas = ["workspace", "overview", "funnels", "councilors", "customers", "tasks"];
    const allowed =
      (method === "GET" && target === "collection" && readAreas.includes(area)) ||
      (method === "PATCH" && target === "item" && (area === "customers" || area === "tasks"));
    return {
      allowed,
      state: allowed
        ? state
        : { ...state, message: "Counselors may only read shared areas and update assigned customers and tasks." },
    };
  }
  if (state.bypassed) return { allowed: true, state };
  if (isBusinessGrowthAdministratorRole(state.roleName)) return { allowed: true, state };

  if (area === "spends")
    return {
      allowed: false,
      state: { ...state, message: "Direct spend records are restricted to Admin and Developer." },
    };

  if (area === "workspace") {
    const allowed =
      method === "GET" &&
      target === "collection" &&
      (state.sidebarPermissions ?? []).some(
        (sidebar) =>
          (sidebar.url === "/dashboard/business-growth" ||
            sidebar.url.startsWith("/dashboard/business-growth/") ||
            sidebar.url === "/dashboard/admin/business-growth" ||
            sidebar.url.startsWith("/dashboard/admin/business-growth/")) &&
          Boolean(sidebar.permissions.read),
      );
    return {
      allowed,
      state: allowed ? state : { ...state, message: "You do not have read permission for Business Growth." },
    };
  }

  const pathname = pageForArea[area];
  if (!areas.has(area) || !pathname)
    return { allowed: false, state: { ...state, message: "Unknown Business Growth resource." } };
  return authorizeDashboard(state, pathname, method);
}

export async function guardBusinessGrowthApiRequest(
  request,
  { area, method, target = "collection", getSession, authorize },
) {
  const session = await getSession(request.headers);
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const decision = await authorize(session, area, method, target);
  return decision.allowed
    ? null
    : Response.json({ error: decision.state?.message ?? "Unauthorized." }, { status: 403 });
}

const aliases = (entries) => new Map(entries.flatMap(([canonical, names]) => names.map((name) => [name, canonical])));

const readKinds = aliases([
  ["workspace", ["workspace"]],
  ["overview", ["overview"]],
  ["customers", ["customer", "customers"]],
  ["tasks", ["task", "tasks"]],
  ["funnels", ["funnel", "funnels"]],
  ["councilors", ["councilor", "councilors", "councillor", "councillors"]],
  ["spends", ["spend", "spends", "demo-spends"]],
]);

export function normalizeBusinessGrowthReadKind(value) {
  if (value === null || value === undefined) return "customers";
  return typeof value === "string" ? (readKinds.get(value.trim().toLowerCase()) ?? null) : null;
}

export function normalizeBusinessGrowthPostKind(value) {
  if (value === undefined) return "customer";
  if (typeof value !== "string") return null;
  const raw = value.trim().toLowerCase();
  if (raw === "demo-spends") return "demo-spends";
  return (
    aliases([
      ["customer", ["customer", "customers"]],
      ["councilor", ["councilor", "councilors", "councillor", "councillors"]],
      ["funnel", ["funnel", "funnels"]],
      ["spend", ["spend", "spends"]],
    ]).get(raw) ?? null
  );
}

export function normalizeBusinessGrowthItemKind(value) {
  if (value === undefined) return "customer";
  if (typeof value !== "string") return null;
  return (
    aliases([
      ["customer", ["customer", "customers"]],
      ["councilor", ["councilor", "councilors", "councillor", "councillors"]],
      ["funnel", ["funnel", "funnels"]],
      ["spend", ["spend", "spends"]],
      ["task", ["task", "tasks"]],
    ]).get(value.trim().toLowerCase()) ?? null
  );
}

export function normalizeBusinessGrowthBulkPatchKind(value) {
  if (value === undefined) return "customers";
  if (typeof value !== "string") return null;
  return aliases([["customers", ["customer", "customers"]]]).get(value.trim().toLowerCase()) ?? null;
}

export function normalizeBusinessGrowthBulkDeleteKind(value) {
  if (value === undefined) return "customers";
  if (typeof value !== "string") return null;
  return (
    aliases([
      ["customers", ["customer", "customers"]],
      ["funnels", ["funnel", "funnels"]],
      ["spends", ["spend", "spends"]],
    ]).get(value.trim().toLowerCase()) ?? null
  );
}

export function normalizeBusinessGrowthBulkPostKind(value) {
  if (value === undefined) return "customers";
  if (typeof value !== "string") return null;
  return (
    aliases([
      ["customers", ["customer", "customers"]],
      ["demo-with-orders", ["demo-with-orders"]],
    ]).get(value.trim().toLowerCase()) ?? null
  );
}
