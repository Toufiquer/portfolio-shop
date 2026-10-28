/*
|-----------------------------------------
| setting up Leads Excel rows share the normal create validation
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import { readLeadBody, withLeads } from "@/app/api/lib/leads-authorization";
import { importLeads, leadKind } from "@/lib/services/leads";

export async function POST(request: Request) {
  return withLeads(request, async (actor) => {
    const body = await readLeadBody(request);
    return Response.json(await importLeads(actor, leadKind(body.kind), body.rows, body.mine === true));
  });
}
