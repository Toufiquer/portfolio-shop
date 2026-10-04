/*
|-----------------------------------------
| Business Growth API authorization tests
|-----------------------------------------
*/

import assert from "node:assert/strict";
import test from "node:test";

import {
  authorizeCouncilorCustomerPatch,
  authorizeBusinessGrowthPolicy,
  guardBusinessGrowthApiRequest,
  normalizeBusinessGrowthBulkDeleteKind,
  normalizeBusinessGrowthBulkPatchKind,
  normalizeBusinessGrowthBulkPostKind,
  normalizeBusinessGrowthItemKind,
  normalizeBusinessGrowthPostKind,
  normalizeBusinessGrowthReadKind,
} from "./business-growth-api-policy.mjs";
import {
  assignedCustomerFilterForEmail,
  assignedCustomersFilterFor,
  assignedCustomersFilterForEmail,
} from "../../../lib/customers/assignment-core.mjs";

const stateFor = (roleName, overrides = {}) => ({
  bypassed: false,
  blocked: false,
  roleName,
  sidebarPermissions: [],
  ...overrides,
});

function directRequest(roleName, area, method, target = "collection", pathKind = null) {
  const base =
    target === "bulk"
      ? "https://shop.test/api/dashboard/business-growth/v1/bulk"
      : target === "item"
        ? "https://shop.test/api/dashboard/business-growth/v1/customer-1"
        : "https://shop.test/api/dashboard/business-growth/v1";
  const url = pathKind ? `${base}?kind=${encodeURIComponent(pathKind)}` : base;
  const request = new Request(url, { method, headers: { cookie: "session=valid" } });
  return guardBusinessGrowthApiRequest(request, {
    area,
    method,
    target,
    getSession: async (headers) => (headers.get("cookie") === "session=valid" ? { roleName } : null),
    authorize: async (session, requestedArea, requestedMethod, requestedTarget) =>
      authorizeBusinessGrowthPolicy(
        stateFor(session.roleName),
        requestedArea,
        requestedMethod,
        requestedTarget,
        async (accessState) => ({ allowed: accessState.sidebarPermissions.length > 0, state: accessState }),
      ),
  });
}

test("direct unauthenticated API requests return 401 even with a spoofed role header", async () => {
  const request = new Request("https://shop.test/api/dashboard/business-growth/v1?kind=customers", {
    headers: { "x-role": "Admin" },
  });
  const response = await guardBusinessGrowthApiRequest(request, {
    area: "customers",
    method: "GET",
    getSession: async (headers) => (headers.get("cookie") ? { roleName: "Admin" } : null),
    authorize: async () => ({ allowed: true, state: stateFor("Admin") }),
  });

  assert.equal(response?.status, 401);
});

test("Admin and Developer retain direct collection, item, and bulk CRUD access", async () => {
  for (const role of ["Admin", "Administrator", "Super Admin", "Super Administrator", "Developer"]) {
    for (const area of ["overview", "funnels", "councilors", "customers", "tasks", "spends"]) {
      for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
        for (const target of ["collection", "item", "bulk"]) {
          assert.equal(
            await directRequest(role, area, method, target),
            null,
            `${role} should be allowed ${method} ${target} ${area}`,
          );
        }
      }
    }
  }
});

test("Counselors can directly read shared and assigned-data APIs, and update only customer/task items", async () => {
  for (const role of ["Councilor", "Councillor"]) {
    for (const [area, kind] of [
      ["overview", "overview"],
      ["funnels", "funnel"],
      ["councilors", "councilor"],
      ["customers", "customer"],
      ["tasks", "task"],
    ]) {
      assert.equal(await directRequest(role, area, "GET", "collection", kind), null);
    }
    assert.equal(await directRequest(role, "customers", "PATCH", "item"), null);
    assert.equal(await directRequest(role, "tasks", "PATCH", "item"), null);
  }

  for (const [area, method, target] of [
    ["spends", "GET", "collection"],
    ["customers", "POST", "collection"],
    ["spends", "POST", "collection"],
    ["funnels", "POST", "collection"],
    ["councilors", "POST", "collection"],
    ["funnels", "PATCH", "item"],
    ["councilors", "PATCH", "item"],
    ["spends", "PATCH", "item"],
    ["customers", "DELETE", "item"],
    ["tasks", "DELETE", "item"],
    ["customers", "PATCH", "bulk"],
    ["customers", "DELETE", "bulk"],
    ["customers", "POST", "bulk"],
  ]) {
    assert.equal((await directRequest("Councilor", area, method, target))?.status, 403);
  }
});

test("Counselor item updates accept only status, notes, and follow-up progress fields", () => {
  const allowed = authorizeCouncilorCustomerPatch({
    id: "customer-1",
    kind: "task",
    customerStatus: "inactive",
    notes: "Call next week.",
    followUps: [{ id: "follow-up-1", note: "Discussed options." }],
  });
  assert.deepEqual(allowed, {
    allowed: true,
    patch: {
      customerStatus: "inactive",
      notes: "Call next week.",
      followUps: [{ id: "follow-up-1", note: "Discussed options." }],
    },
  });

  for (const field of [
    "councilorId",
    "councilorEmail",
    "reassign",
    "name",
    "email",
    "mobileNumber",
    "funnelId",
    "createdAt",
    "updatedAt",
    "metrics",
  ]) {
    const decision = authorizeCouncilorCustomerPatch({ [field]: "forged-value", notes: "Progress" });
    assert.equal(decision.allowed, false, `${field} must not be Counselor editable`);
    assert.equal(decision.status, 403);
  }
  assert.equal(authorizeCouncilorCustomerPatch({ customerStatus: "archived" }).allowed, false);
  assert.equal(authorizeCouncilorCustomerPatch({ notes: "x".repeat(2001) }).allowed, false);
  assert.equal(authorizeCouncilorCustomerPatch({ followUps: Array(101).fill({ note: "x" }) }).allowed, false);
});

test("Counselor role restrictions still apply when the general dashboard authorization bypass is enabled", async () => {
  const state = stateFor("Councilor", { bypassed: true });

  assert.equal(
    (await authorizeBusinessGrowthPolicy(state, "customers", "PATCH", "item", async () => ({ allowed: false, state })))
      .allowed,
    true,
  );
  assert.equal(
    (await authorizeBusinessGrowthPolicy(state, "customers", "DELETE", "item", async () => ({ allowed: true, state })))
      .allowed,
    false,
  );
  assert.equal(
    (await authorizeBusinessGrowthPolicy(state, "customers", "PATCH", "bulk", async () => ({ allowed: true, state })))
      .allowed,
    false,
  );
});

test("Business Growth kind aliases resolve to one authorized handler and unsupported actions fail closed", () => {
  assert.equal(normalizeBusinessGrowthReadKind("customer"), "customers");
  assert.equal(normalizeBusinessGrowthReadKind("funnel"), "funnels");
  assert.equal(normalizeBusinessGrowthReadKind("councilor"), "councilors");
  assert.equal(normalizeBusinessGrowthReadKind("task"), "tasks");
  assert.equal(normalizeBusinessGrowthReadKind("demo-spends"), "spends");
  assert.equal(normalizeBusinessGrowthReadKind("user-search"), null);

  assert.equal(normalizeBusinessGrowthPostKind("customers"), "customer");
  assert.equal(normalizeBusinessGrowthPostKind("councillors"), "councilor");
  assert.equal(normalizeBusinessGrowthPostKind("funnels"), "funnel");
  assert.equal(normalizeBusinessGrowthPostKind("spends"), "spend");
  for (const value of ["workspace", "overview", "tasks", "user-search", {}, null])
    assert.equal(normalizeBusinessGrowthPostKind(value), null);

  assert.equal(normalizeBusinessGrowthItemKind("customers"), "customer");
  assert.equal(normalizeBusinessGrowthItemKind("task"), "task");
  for (const value of ["workspace", "overview", "user-search", {}, null])
    assert.equal(normalizeBusinessGrowthItemKind(value), null);

  assert.equal(normalizeBusinessGrowthBulkPatchKind("customer"), "customers");
  assert.equal(normalizeBusinessGrowthBulkPatchKind("councilors"), null);
  assert.equal(normalizeBusinessGrowthBulkDeleteKind("funnels"), "funnels");
  assert.equal(normalizeBusinessGrowthBulkDeleteKind("overview"), null);
  assert.equal(normalizeBusinessGrowthBulkPostKind("demo-with-orders"), "demo-with-orders");
  assert.equal(normalizeBusinessGrowthBulkPostKind("councilors"), null);
});

test("Counselor item ownership filter includes only that Counselor's current and valid legacy assignments", () => {
  const filter = assignedCustomersFilterFor({ id: "councilor-a", email: "A@example.com" });
  const matches = (customer) =>
    filter.$or.some((clause) =>
      Object.entries(clause).every(([key, value]) => {
        if (key === "councilorId" && value === null) return (customer.councilorId ?? null) === null;
        return customer[key] === value;
      }),
    );

  assert.equal(matches({ id: "customer-a", councilorId: "councilor-a" }), true);
  assert.equal(matches({ id: "customer-b", councilorId: "councilor-b" }), false);
  assert.equal(matches({ id: "legacy-a", councilorId: null, councilorEmail: "a@example.com" }), true);
  assert.equal(matches({ id: "legacy-without-id", councilorEmail: "a@example.com" }), true);
  assert.equal(matches({ id: "legacy-b", councilorId: null, councilorEmail: "b@example.com" }), false);
  assert.equal(matches({ id: "unassigned", councilorId: null, councilorEmail: null }), false);
});

test("My Customer filter uses only the normalized session email", () => {
  assert.deepEqual(assignedCustomersFilterForEmail(" Counselor@Example.com "), {
    councilorEmail: "counselor@example.com",
  });
  assert.equal(assignedCustomersFilterForEmail(""), null);
  assert.deepEqual(assignedCustomerFilterForEmail("customer-a", "Counselor@example.com"), {
    id: "customer-a",
    councilorEmail: "counselor@example.com",
  });
});

test("blocked roles remain denied before the administrator shortcut", async () => {
  const state = stateFor("Developer", { blocked: true });
  const decision = await authorizeBusinessGrowthPolicy(state, "customers", "GET", "collection", async () => ({
    allowed: true,
    state,
  }));

  assert.equal(decision.allowed, false);
});
