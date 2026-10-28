/*
|-----------------------------------------
| setting up an empty-workspace Leads demo data endpoint
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import { withLeads } from "@/app/api/lib/leads-authorization";
import { leadsDemoState, seedLeadsDemo } from "@/lib/services/leads";

export async function GET(request: Request) {
  return withLeads(request, async (actor) => Response.json(await leadsDemoState(actor)));
}
export async function POST(request: Request) {
  return withLeads(request, async (actor) => Response.json(await seedLeadsDemo(actor)));
}
