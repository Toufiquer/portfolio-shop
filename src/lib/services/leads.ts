/*
|-----------------------------------------
| setting up Leads operations, ownership, and server-derived analytics
| @author: Codex
|-----------------------------------------
*/

import "server-only";

import { randomUUID } from "crypto";

import { MongoServerError, type Filter } from "mongodb";

import {
  isLeadKind,
  leadClaimFilter,
  leadIds,
  leadCan,
  leadIsManager,
  leadOwnershipFilter,
  normalizeLeadEmail,
  normalizeLeadMobile,
  parseLeadInput,
  type LeadActor,
  type LeadInput,
  type LeadItem,
  type LeadKind,
  type LeadOverview,
} from "@/lib/dashboard/leads";
import type { DashboardOperation } from "@/lib/dashboard/permissions";
import { ensureLeadIndexes, leadActivitiesCollection, leadsCollection, type LeadDocument } from "@/lib/models/leads";

export class LeadError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const serialize = (doc: LeadDocument): LeadItem => {
  const { _id: _ignored, ...item } = doc as LeadDocument & { _id?: unknown };
  void _ignored;
  return { ...item, createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString() } as LeadItem;
};
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function leadKind(raw: unknown) {
  if (!isLeadKind(raw)) throw new LeadError("Choose funnels, customers, or councilors.");
  return raw;
}
function input(kind: LeadKind, raw: unknown) {
  try {
    return parseLeadInput(kind, raw);
  } catch (error) {
    throw new LeadError(error instanceof Error ? error.message : "Invalid details.");
  }
}
export function selectedIds(raw: unknown) {
  try {
    return leadIds(raw);
  } catch (error) {
    throw new LeadError(error instanceof Error ? error.message : "Invalid selection.");
  }
}
export async function requireActiveCouncilor(actor: LeadActor) {
  if (
    !actor.bypassed &&
    actor.role === "councilor" &&
    !(await leadsCollection("councilors").findOne({ email: actor.email, status: "active" }))
  )
    throw new LeadError("An Admin must add your email as an active councilor before you can use Leads.", 403);
}
function requireAdmin(actor: LeadActor, kind: LeadKind) {
  if (kind !== "customers" && !leadIsManager(actor))
    throw new LeadError("Only a Developer or Admin can manage funnels and councilors.", 403);
}
function requirePermission(actor: LeadActor, area: string, operation: DashboardOperation) {
  if (!leadCan(actor, area, operation))
    throw new LeadError(`You do not have ${operation} permission for this Leads area.`, 403);
}
const areaFor = (kind: LeadKind, mine: boolean) => (mine && kind === "customers" ? "my-leads" : kind);

export async function leadOptions(actor: LeadActor, query: URLSearchParams) {
  const kind = leadKind(query.get("lookup"));
  if (kind === "customers") throw new LeadError("Choose funnels or councilors.");
  const area = query.get("area") === "my-leads" ? "my-leads" : "customers";
  if (!["read", "create", "update"].some((operation) => leadCan(actor, area, operation as DashboardOperation)))
    throw new LeadError("You cannot use options for this Leads area.", 403);
  const search = query.get("search")?.trim() ?? "";
  if (search.length > 160) throw new LeadError("Search must contain at most 160 characters.");
  const filter: Filter<LeadDocument> = {
    ...(query.get("status") === "active" ? { status: "active" } : {}),
    ...(kind === "councilors" && !leadIsManager(actor) ? { email: actor.email } : {}),
    ...(search ? { name: { $regex: escapeRegex(search), $options: "i" } } : {}),
  };
  const pageSize = [10, 25, 50, 100].includes(Number(query.get("pageSize"))) ? Number(query.get("pageSize")) : 10;
  const requestedPage = Number(query.get("page"));
  const page = Math.max(1, Math.floor(Number.isFinite(requestedPage) ? requestedPage : 1));
  const collection = leadsCollection(kind);
  const [rows, total] = await Promise.all([
    collection
      .find(filter, { projection: { id: 1, name: 1, email: 1 } })
      .sort({ name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);
  return {
    items: rows.map((row) => ({
      value: row.kind === "councilors" || kind === "councilors" ? (row as { email: string }).email : row.id,
      name: row.name,
    })),
    total,
    page,
    pageSize,
  };
}
async function validateReferences(data: LeadInput, existing?: LeadDocument | null) {
  if (data.kind !== "customers") return;
  const unchanged = existing?.kind === "customers" && existing.funnelId === data.funnelId;
  if (!(await leadsCollection("funnels").findOne({ id: data.funnelId, ...(unchanged ? {} : { status: "active" }) })))
    throw new LeadError("Choose an existing active funnel.");
}
export function leadListFilter(actor: LeadActor, query: URLSearchParams) {
  const kind = leadKind(query.get("kind"));
  const mine = query.get("mine") === "true";
  const filter: Filter<LeadDocument> = kind === "customers" ? leadOwnershipFilter(actor, mine) : {};
  const status = query.get("status");
  if (status) {
    if (status !== "active" && status !== "inactive") throw new LeadError("Invalid status.");
    filter.status = status;
  }
  if (kind === "customers") {
    if (query.get("funnelId")) filter.funnelId = query.get("funnelId");
    const assignment = query.get("assignment");
    const councilor = query.get("councilor");
    // Additional filters can only narrow the session-owned My Leads predicate.
    const constraints: Filter<LeadDocument>[] = [];
    if (assignment === "assigned") constraints.push({ assignedTo: { $ne: null } });
    else if (assignment === "unassigned") constraints.push({ assignedTo: null });
    else if (assignment) throw new LeadError("Invalid assignment filter.");
    if (councilor) constraints.push({ assignedTo: normalizeLeadEmail(councilor) });
    if (constraints.length) filter.$and = constraints;
  }
  const search = query.get("search")?.trim();
  if (search) {
    if (search.length > 160) throw new LeadError("Search must contain at most 160 characters.");
    filter.$or = ["name", ...(kind === "funnels" ? ["description"] : ["email", "mobile"])].map((key) => ({
      [key]: { $regex: escapeRegex(search), $options: "i" },
    }));
    const mobile = normalizeLeadMobile(search);
    if (mobile && kind !== "funnels") filter.$or.push({ mobile });
  }
  return { kind, filter };
}
export async function listLeads(actor: LeadActor, query: URLSearchParams) {
  requirePermission(actor, areaFor(leadKind(query.get("kind")), query.get("mine") === "true"), "read");
  const { kind, filter } = leadListFilter(actor, query);
  const requestedSize = Number(query.get("pageSize")) || 10;
  const pageSize = [10, 25, 50, 100].includes(requestedSize) ? requestedSize : 10;
  const requestedPage = Number(query.get("page")) || 1;
  const collection = leadsCollection(kind);
  const total = await collection.countDocuments(filter);
  const page = Math.min(
    Math.max(1, Math.floor(Number.isFinite(requestedPage) ? requestedPage : 1)),
    Math.max(1, Math.ceil(total / pageSize)),
  );
  const items = await collection
    .find(filter)
    .sort(kind === "funnels" ? { position: 1 } : { createdAt: -1, id: 1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
  const serialized = items.map(serialize);
  if (kind === "customers") {
    const customerItems = serialized.filter((item) => item.kind === "customers");
    const [funnels, councilors] = await Promise.all([
      leadsCollection("funnels")
        .find({ id: { $in: customerItems.map((item) => item.funnelId) } })
        .toArray(),
      leadsCollection("councilors")
        .find({ email: { $in: customerItems.flatMap((item) => (item.assignedTo ? [item.assignedTo] : [])) } })
        .toArray(),
    ]);
    customerItems.forEach((item) => {
      item.funnelName = funnels.find((funnel) => funnel.id === item.funnelId)?.name ?? "Unavailable funnel";
      item.assignedName = councilors.find(
        (councilor) => councilor.kind === "councilors" && councilor.email === item.assignedTo,
      )?.name;
    });
  }
  return { items: serialized, total, page, pageSize, actor };
}
export async function createLead(actor: LeadActor, kind: LeadKind, raw: unknown, mine: boolean) {
  requirePermission(actor, areaFor(kind, mine), "create");
  requireAdmin(actor, kind);
  const data = input(kind, raw);
  await validateReferences(data);
  await ensureLeadIndexes();
  const now = new Date();
  const assignedTo = kind === "customers" && (mine || !leadIsManager(actor)) ? actor.email : null;
  const item: LeadDocument = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...(kind === "customers"
      ? { assignedTo, assignedAt: assignedTo ? now.toISOString() : null, lastCounselledAt: null }
      : {}),
  } as LeadDocument;
  await leadsCollection(kind).insertOne(item);
  if (assignedTo) await logActivity(item.id, assignedTo, "assigned", now);
  return { item: serialize(item) };
}
async function logActivity(customerId: string, councilor: string, type: "assigned" | "counselled", createdAt: Date) {
  await leadActivitiesCollection().insertOne({ id: randomUUID(), customerId, councilor, type, createdAt });
}
export async function updateLead(actor: LeadActor, kind: LeadKind, id: string, raw: unknown, mine: boolean) {
  requirePermission(actor, areaFor(kind, mine), "update");
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new LeadError("Enter valid details.");
  const body = raw as Record<string, unknown>;
  const collection = leadsCollection(kind);
  const now = new Date();
  if (body.action) {
    if (kind !== "customers") throw new LeadError("This action requires a customer.");
    if (Object.keys(body).some((key) => !["action", "assignedTo"].includes(key)))
      throw new LeadError("Unsupported action fields.");
    if (body.action === "claim") {
      if ((!actor.bypassed && actor.role !== "councilor") || mine)
        throw new LeadError("Claim an unassigned customer from Customers as a councilor.", 403);
      const item = await collection.findOneAndUpdate(
        leadClaimFilter(id),
        { $set: { assignedTo: actor.email, assignedAt: now.toISOString(), updatedAt: now } },
        { returnDocument: "after" },
      );
      if (!item)
        throw new LeadError(
          "This customer is already assigned, inactive, blocked, or unavailable. Refresh and try again.",
          409,
        );
      await logActivity(id, actor.email, "assigned", now);
      return { item: serialize(item) };
    }
    if (body.action === "assign") {
      if (!leadIsManager(actor) || mine)
        throw new LeadError("Only an Admin can assign or change councilors from Customers.", 403);
      if (body.assignedTo !== null && typeof body.assignedTo !== "string")
        throw new LeadError("Choose a councilor or unassigned.");
      const assignedTo = typeof body.assignedTo === "string" ? normalizeLeadEmail(body.assignedTo) : null;
      if (assignedTo && !(await leadsCollection("councilors").findOne({ email: assignedTo, status: "active" })))
        throw new LeadError("Choose an active councilor.");
      const item = await collection.findOneAndUpdate(
        { id },
        { $set: { assignedTo, assignedAt: assignedTo ? now.toISOString() : null, updatedAt: now } },
        { returnDocument: "after" },
      );
      if (!item) throw new LeadError("Customer not found.", 404);
      if (assignedTo) await logActivity(id, assignedTo, "assigned", now);
      return { item: serialize(item) };
    }
    if (body.action === "counsel") {
      const item = await collection.findOneAndUpdate(
        { id, assignedTo: actor.email, blocked: false, status: "active" },
        { $set: { lastCounselledAt: now.toISOString(), updatedAt: now } },
        { returnDocument: "after" },
      );
      if (!item) throw new LeadError("Only your active, unblocked customer can be marked counselled.", 403);
      await logActivity(id, actor.email, "counselled", now);
      return { item: serialize(item) };
    }
    throw new LeadError("Unknown customer action.");
  }
  requireAdmin(actor, kind);
  const filter: Filter<LeadDocument> = { id, ...(kind === "customers" ? leadOwnershipFilter(actor, mine, true) : {}) };
  const existing = await collection.findOne(filter);
  if (!existing) throw new LeadError("Record not found or not assigned to you.", 404);
  const data = input(kind, raw);
  await validateReferences(data, existing);
  if (
    data.kind === "councilors" &&
    existing.kind === "councilors" &&
    data.email !== existing.email &&
    (await leadsCollection("customers").findOne({ assignedTo: existing.email }))
  )
    throw new LeadError("Reassign this councilor's customers before changing their email.", 409);
  await ensureLeadIndexes();
  const item = await collection.findOneAndUpdate(
    filter,
    { $set: { ...data, updatedAt: now } },
    { returnDocument: "after" },
  );
  if (!item) throw new LeadError("Assignment changed. Refresh and try again.", 409);
  return { item: serialize(item) };
}
export async function bulkLeads(actor: LeadActor, kind: LeadKind, ids: string[], mine: boolean, status?: unknown) {
  requirePermission(actor, areaFor(kind, mine), status === undefined ? "delete" : "update");
  requireAdmin(actor, kind);
  const collection = leadsCollection(kind);
  const filter: Filter<LeadDocument> = {
    id: { $in: ids },
    ...(kind === "customers" ? leadOwnershipFilter(actor, mine, true) : {}),
  };
  const records = await collection.find(filter).toArray();
  if (records.length !== ids.length)
    throw new LeadError("Some records no longer exist or are not assigned to you. Refresh the list.", 409);
  if (status !== undefined) {
    if (status !== "active" && status !== "inactive") throw new LeadError("Choose active or inactive status.");
    return {
      updatedCount: (await collection.updateMany(filter, { $set: { status, updatedAt: new Date() } })).modifiedCount,
    };
  }
  if (kind === "funnels" && (await leadsCollection("customers").findOne({ funnelId: { $in: ids } })))
    throw new LeadError("Move customers out of the selected funnels before deleting them.", 409);
  if (kind === "councilors") {
    const emails = records.flatMap((record) => (record.kind === "councilors" ? [record.email] : []));
    if (await leadsCollection("customers").findOne({ assignedTo: { $in: emails } }))
      throw new LeadError("Reassign customers before deleting their councilor.", 409);
  }
  return { deletedCount: (await collection.deleteMany(filter)).deletedCount };
}
export function leadErrorResponse(error: unknown) {
  if (error instanceof LeadError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof MongoServerError && error.code === 11000)
    return Response.json(
      { error: "That mobile, councilor email, or funnel position already exists. Choose a unique value." },
      { status: 409 },
    );
  console.error("Leads request failed", error instanceof Error ? error.name : "Unknown error");
  return Response.json({ error: "Could not complete the Leads request. Please try again." }, { status: 500 });
}

export async function importLeads(actor: LeadActor, kind: LeadKind, raw: unknown, mine: boolean) {
  requirePermission(actor, areaFor(kind, mine), "create");
  requireAdmin(actor, kind);
  if (kind === "funnels") throw new LeadError("Excel import supports customers and councilors.");
  if (!Array.isArray(raw) || !raw.length || raw.length > 100)
    throw new LeadError("Import between 1 and 100 rows per file.");
  const errors: { row: number; error: string }[] = [];
  let imported = 0;
  // Each row uses the same validation, unique indexes, and session ownership as CRUD.
  for (let index = 0; index < raw.length; index++) {
    try {
      await createLead(actor, kind, raw[index], mine);
      imported++;
    } catch (error) {
      if (!(error instanceof LeadError) && !(error instanceof MongoServerError && error.code === 11000)) throw error;
      errors.push({ row: index + 2, error: error instanceof LeadError ? error.message : "Duplicate mobile or email." });
    }
  }
  return { imported, errors };
}

export async function leadsOverview(actor: LeadActor): Promise<LeadOverview> {
  requirePermission(actor, "overview", "read");
  const now = new Date();
  const localNow = new Date(now.getTime() + 6 * 60 * 60_000);
  const monthKeys = Array.from({ length: 12 }, (_, index) =>
    new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth() - 11 + index, 1)).toISOString().slice(0, 7),
  );
  const since = new Date(`${monthKeys[0]}-01T00:00:00+06:00`);
  const customers = leadsCollection("customers");
  const scope = leadOwnershipFilter(actor, false);
  const activityScope = leadIsManager(actor) ? {} : { councilor: actor.email };
  const [
    all,
    new30Days,
    active,
    inactive,
    funnels,
    councilors,
    mine,
    progressRows,
    activityRows,
    cohortRows,
    monthlyActivities,
  ] = await Promise.all([
    customers.countDocuments(scope),
    customers.countDocuments({ ...scope, createdAt: { $gte: new Date(now.getTime() - 30 * 86400_000) } }),
    customers.countDocuments({ ...scope, status: "active" }),
    customers.countDocuments({ ...scope, status: "inactive" }),
    leadsCollection("funnels").find({}).sort({ position: 1 }).toArray(),
    leadsCollection("councilors")
      .find(leadIsManager(actor) ? {} : { email: actor.email })
      .sort({ name: 1 })
      .toArray(),
    customers.countDocuments({ assignedTo: actor.email }),
    customers
      .aggregate<{ _id: string | null; assigned: number; inactive: number }>([
        { $match: scope },
        {
          $group: {
            _id: "$assignedTo",
            assigned: { $sum: 1 },
            inactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
          },
        },
      ])
      .toArray(),
    leadActivitiesCollection()
      .aggregate<{ _id: string; count: number }>([
        { $match: { ...activityScope, type: "counselled", createdAt: { $gte: new Date(now.getTime() - 86400_000) } } },
        { $group: { _id: "$councilor", count: { $sum: 1 } } },
      ])
      .toArray(),
    customers
      .aggregate<{ _id: { month: string; funnelId: string; status: string; blocked: boolean }; count: number }>([
        { $match: { ...scope, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              month: { $dateToString: { date: "$createdAt", format: "%Y-%m", timezone: "Asia/Dhaka" } },
              funnelId: "$funnelId",
              status: "$status",
              blocked: "$blocked",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    leadActivitiesCollection()
      .aggregate<{ _id: { month: string; type: string }; count: number }>([
        { $match: { ...activityScope, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              month: { $dateToString: { date: "$createdAt", format: "%Y-%m", timezone: "Asia/Dhaka" } },
              type: "$type",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
  ]);
  const councilorItems = councilors.filter((record) => record.kind === "councilors");
  const emails = new Set([
    ...councilorItems.map((record) => record.email),
    ...progressRows.flatMap((row) => (row._id ? [row._id] : [])),
    ...activityRows.map((row) => row._id),
  ]);
  const progress = [...emails].map((email) => {
    const row = progressRows.find((item) => item._id === email);
    return {
      email,
      name: councilorItems.find((item) => item.email === email)?.name ?? email,
      assigned: row?.assigned ?? 0,
      inactive: row?.inactive ?? 0,
      counselling24Hours: activityRows.find((item) => item._id === email)?.count ?? 0,
    };
  });
  const months = monthKeys.map((month) => {
    const rows = cohortRows.filter((row) => row._id.month === month);
    const sum = (test: (row: (typeof rows)[number]) => boolean) =>
      rows.filter(test).reduce((total, row) => total + row.count, 0);
    return {
      month,
      customers: sum(() => true),
      active: sum((row) => row._id.status === "active"),
      inactive: sum((row) => row._id.status === "inactive"),
      blocked: sum((row) => row._id.blocked),
      assignments: monthlyActivities.find((row) => row._id.month === month && row._id.type === "assigned")?.count ?? 0,
      counselling:
        monthlyActivities.find((row) => row._id.month === month && row._id.type === "counselled")?.count ?? 0,
      funnels: funnels.map((funnel) => ({ name: funnel.name, count: sum((row) => row._id.funnelId === funnel.id) })),
    };
  });
  return {
    actor,
    summary: { all, new30Days, active, inactive },
    counts: { funnels: funnels.length, councilors: councilors.length, customers: all, mine },
    progress,
    months,
  };
}
