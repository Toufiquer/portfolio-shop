/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 07 September, 2026
|-----------------------------------------
*/

import { client } from "@/app/api/lib/auth";
import { type Category, type Product } from "@/lib/dashboard/catalog";

import { authorizeCategoryRequest } from "../route";

const categories = () => client.db().collection<Category>("categories");
const products = () => client.db().collection<Product>("products");

function idsFrom(body: unknown) {
  const ids = (body as { ids?: unknown } | null)?.ids;
  return Array.isArray(ids)
    ? [
        ...new Set(
          ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0).map((id) => id.trim()),
        ),
      ]
    : [];
}

export async function DELETE(request: Request) {
  const access = await authorizeCategoryRequest(request, "DELETE");
  if ("error" in access) return access.error;
  const ids = idsFrom(await request.json().catch(() => null));
  if (!ids.length || ids.length > 100)
    return Response.json({ error: "Select between 1 and 100 categories." }, { status: 400 });
  const referenced = await products().findOne({ categories: { $in: ids } }, { projection: { id: 1 } });
  if (referenced)
    return Response.json(
      { error: "One or more selected categories are assigned to products. Remove them from those products first." },
      { status: 409 },
    );
  const result = await categories().deleteMany({ id: { $in: ids } });
  return Response.json({ deletedCount: result.deletedCount });
}

export async function PATCH(request: Request) {
  const access = await authorizeCategoryRequest(request, "PATCH");
  if ("error" in access) return access.error;
  const body = (await request.json().catch(() => null)) as { ids?: unknown; status?: unknown } | null;
  const ids = idsFrom(body);
  if (!ids.length || ids.length > 100)
    return Response.json({ error: "Select between 1 and 100 categories." }, { status: 400 });
  if (body?.status !== "active" && body?.status !== "inactive")
    return Response.json({ error: "Choose a valid category status." }, { status: 400 });
  const result = await categories().updateMany(
    { id: { $in: ids } },
    { $set: { status: body.status, updatedAt: new Date() } },
  );
  return Response.json({ updatedCount: result.modifiedCount });
}
