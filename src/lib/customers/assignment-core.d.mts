import type { Collection } from "mongodb";

export type CustomerAssignmentResult = {
  status: "assigned" | "reassigned" | "conflict" | "not_found";
  reason?: "already_assigned" | "already_unassigned" | "assignment_changed";
  currentCouncilorId?: string | null;
  currentCouncilorEmail?: string | null;
};

export declare function assignedCustomersFilterFor(councilor: { id: string; email?: string | null }): {
  $or: ({ councilorId: string } | { councilorId: null; councilorEmail: string })[];
};

export declare function assignedCustomersFilterForEmail(email?: string | null): { councilorEmail: string } | null;

export declare function assignedCustomerFilterForEmail(
  customerId: string,
  email?: string | null,
): { id: string; councilorEmail: string } | null;

export declare function assignedCustomerFilterFor(
  customerId: string,
  councilor: { id: string; email?: string | null },
): {
  id: string;
  $or: ({ councilorId: string } | { councilorId: null; councilorEmail: string })[];
};

export declare function assignCustomerAtomically(
  customers: Collection<any>,
  input: {
    customerId: string;
    councilorId: string | null;
    councilorEmail: string | null;
    reassign?: boolean;
    updatedAt: Date;
  },
): Promise<CustomerAssignmentResult>;
