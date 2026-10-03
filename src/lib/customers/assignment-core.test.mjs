import assert from "node:assert/strict";
import test from "node:test";

import { assignCustomerAtomically, assignedCustomerFilterFor } from "./assignment-core.mjs";

function memoryCollection(initial) {
  const items = new Map(initial.map((item) => [item.id, structuredClone(item)]));
  return {
    items,
    async findOne(filter) {
      const item = items.get(filter.id);
      return item ? structuredClone(item) : null;
    },
    async updateOne(filter, update) {
      const item = items.get(filter.id);
      if (!item || !matchesOwner(item, filter)) return { matchedCount: 0, modifiedCount: 0 };
      Object.assign(item, structuredClone(update.$set));
      return { matchedCount: 1, modifiedCount: 1 };
    },
  };
}

function matchesOwner(item, filter) {
  if (Object.hasOwn(filter, "councilorId") && (item.councilorId ?? null) !== filter.councilorId) return false;
  if (typeof filter.councilorEmail === "string" && item.councilorEmail !== filter.councilorEmail) return false;
  if (filter.councilorEmail?.$in && !filter.councilorEmail.$in.includes(item.councilorEmail ?? null)) return false;
  return true;
}

const assignment = (collection, customerId, councilorId, councilorEmail, reassign = false) =>
  assignCustomerAtomically(collection, {
    customerId,
    councilorId,
    councilorEmail,
    reassign,
    updatedAt: new Date("2026-09-30T00:00:00.000Z"),
  });

test("concurrent requests cannot assign one customer to two Counselors", async () => {
  const collection = memoryCollection([{ id: "customer-1" }]);

  const results = await Promise.all([
    assignment(collection, "customer-1", "councilor-a", "a@example.com"),
    assignment(collection, "customer-1", "councilor-b", "b@example.com"),
  ]);

  assert.equal(results.filter((result) => result.status === "assigned").length, 1);
  assert.equal(results.filter((result) => result.status === "conflict").length, 1);
  assert.ok(["councilor-a", "councilor-b"].includes(collection.items.get("customer-1").councilorId));
});

test("repeated assignment to an already assigned customer returns a conflict", async () => {
  const collection = memoryCollection([{ id: "customer-1" }]);

  assert.equal((await assignment(collection, "customer-1", "councilor-a", "a@example.com")).status, "assigned");
  const repeated = await assignment(collection, "customer-1", "councilor-a", "a@example.com");

  assert.deepEqual(repeated, {
    status: "conflict",
    reason: "already_assigned",
    currentCouncilorId: "councilor-a",
    currentCouncilorEmail: "a@example.com",
  });
  assert.equal(collection.items.get("customer-1").councilorId, "councilor-a");
});

test("legacy email-only ownership is preserved until an explicit reassignment", async () => {
  const collection = memoryCollection([{ id: "customer-1", councilorEmail: "old@example.com" }]);

  const duplicate = await assignment(collection, "customer-1", "councilor-a", "a@example.com");
  assert.equal(duplicate.status, "conflict");
  assert.equal(collection.items.get("customer-1").councilorEmail, "old@example.com");

  const reassigned = await assignment(collection, "customer-1", "councilor-a", "a@example.com", true);
  assert.equal(reassigned.status, "reassigned");
  assert.equal(collection.items.get("customer-1").councilorId, "councilor-a");
  assert.equal(collection.items.get("customer-1").councilorEmail, "a@example.com");
});

test("Counselor customer item filters combine the requested id with current and legacy ownership", () => {
  const filter = assignedCustomerFilterFor("customer-a", { id: "councilor-a", email: "A@example.com" });
  const matches = (customer) =>
    customer.id === filter.id &&
    filter.$or.some((branch) =>
      Object.entries(branch).every(([key, value]) => {
        if (key === "councilorId" && value === null) return (customer.councilorId ?? null) === null;
        return customer[key] === value;
      }),
    );

  assert.equal(matches({ id: "customer-a", councilorId: "councilor-a" }), true);
  assert.equal(matches({ id: "customer-a", councilorId: null, councilorEmail: "a@example.com" }), true);
  assert.equal(matches({ id: "customer-a", councilorId: "councilor-b" }), false);
  assert.equal(matches({ id: "customer-b", councilorId: "councilor-a" }), false);
});

test("concurrent reassignments use compare-and-set so only one can replace the old owner", async () => {
  const collection = memoryCollection([
    { id: "customer-1", councilorId: "councilor-old", councilorEmail: "old@example.com" },
  ]);

  const results = await Promise.all([
    assignment(collection, "customer-1", "councilor-a", "a@example.com", true),
    assignment(collection, "customer-1", "councilor-b", "b@example.com", true),
  ]);

  assert.equal(results.filter((result) => result.status === "reassigned").length, 1);
  assert.equal(results.filter((result) => result.status === "conflict").length, 1);
  assert.ok(["councilor-a", "councilor-b"].includes(collection.items.get("customer-1").councilorId));
});
