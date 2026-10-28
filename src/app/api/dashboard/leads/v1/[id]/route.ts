/*
|-----------------------------------------
| setting up Leads for the apps
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import { readLeadBody, withLeads } from "@/app/api/lib/leads-authorization";
import { bulkLeads, leadKind, selectedIds, updateLead } from "@/lib/services/leads";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  return withLeads(request, async (actor) => {
    const { id } = await context.params;
    const query = new URL(request.url).searchParams;
    return Response.json(
      await updateLead(
        actor,
        leadKind(query.get("kind")),
        id,
        await readLeadBody(request),
        query.get("mine") === "true",
      ),
    );
  });
}
export async function DELETE(request: Request, context: Context) {
  return withLeads(request, async (actor) => {
    const { id } = await context.params;
    const query = new URL(request.url).searchParams;
    return Response.json(
      await bulkLeads(actor, leadKind(query.get("kind")), selectedIds([id]), query.get("mine") === "true"),
    );
  });
}
