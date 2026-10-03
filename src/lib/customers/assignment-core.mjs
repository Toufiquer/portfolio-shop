/*
|-----------------------------------------
| atomic Business Growth customer assignment
|-----------------------------------------
*/

const normalize = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

export function assignedCustomersFilterFor(councilor) {
  const emails = [...new Set([normalize(councilor.email)].filter(Boolean))];
  return {
    $or: [{ councilorId: councilor.id }, ...emails.map((councilorEmail) => ({ councilorId: null, councilorEmail }))],
  };
}

export function assignedCustomerFilterFor(customerId, councilor) {
  return { id: customerId, ...assignedCustomersFilterFor(councilor) };
}

const assignmentFilterFor = (customer) => {
  const councilorId = typeof customer.councilorId === "string" ? customer.councilorId.trim() : "";
  if (councilorId) return { id: customer.id, councilorId };

  const councilorEmail = typeof customer.councilorEmail === "string" ? customer.councilorEmail : "";
  if (normalize(councilorEmail)) return { id: customer.id, councilorId: null, councilorEmail };

  return { id: customer.id, councilorId: null, councilorEmail: { $in: [null, ""] } };
};

/**
 * Compare and set the owner fields on one customer document. MongoDB makes
 * updateOne atomic for that document; the prior owner is part of the filter,
 * so only one concurrent assignment or reassignment can win.
 *
 * @param {import("mongodb").Collection<any>} customers
 * @param {{ customerId: string; councilorId: string | null; councilorEmail: string | null; reassign?: boolean; updatedAt: Date }} input
 * @returns {Promise<{ status: "assigned" | "reassigned" | "conflict" | "not_found"; reason?: "already_assigned" | "already_unassigned" | "assignment_changed"; currentCouncilorId?: string | null; currentCouncilorEmail?: string | null }>}
 */
export async function assignCustomerAtomically(customers, input) {
  const customer = await customers.findOne(
    { id: input.customerId },
    { projection: { id: 1, councilorId: 1, councilorEmail: 1 } },
  );
  if (!customer) return { status: "not_found" };

  const currentCouncilorId = typeof customer.councilorId === "string" ? customer.councilorId.trim() : "";
  const currentCouncilorEmail = typeof customer.councilorEmail === "string" ? customer.councilorEmail : "";
  const hasOwner = Boolean(currentCouncilorId || normalize(currentCouncilorEmail));
  const sameOwner = input.councilorId
    ? currentCouncilorId
      ? currentCouncilorId === input.councilorId
      : normalize(currentCouncilorEmail) === normalize(input.councilorEmail)
    : !hasOwner;

  if (sameOwner)
    return {
      status: "conflict",
      reason: input.councilorId ? "already_assigned" : "already_unassigned",
      currentCouncilorId: currentCouncilorId || null,
      currentCouncilorEmail: currentCouncilorEmail || null,
    };

  if (hasOwner && !input.reassign)
    return {
      status: "conflict",
      reason: "already_assigned",
      currentCouncilorId: currentCouncilorId || null,
      currentCouncilorEmail: currentCouncilorEmail || null,
    };

  const result = await customers.updateOne(assignmentFilterFor(customer), {
    $set: {
      councilorId: input.councilorId,
      councilorEmail: input.councilorEmail,
      updatedAt: input.updatedAt,
    },
  });
  if (result.modifiedCount !== 1)
    return { status: "conflict", reason: "assignment_changed", currentCouncilorId: currentCouncilorId || null };

  return { status: hasOwner ? "reassigned" : "assigned" };
}
