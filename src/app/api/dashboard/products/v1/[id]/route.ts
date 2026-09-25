/*
|-----------------------------------------
| setting up route.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import {
  authorizeProductRequest,
  duplicateProductError,
  ensureProductIndexes,
  serializeProduct,
  validateProductCategories,
} from "@/app/api/dashboard/products/v1/route";
import { parseProductInput } from "@/lib/dashboard/catalog";
import { removeProduct, updateProductForApi } from "@/lib/services/products";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeProductRequest(request, "PATCH");
  if ("error" in access) return access.error;
  const data = parseProductInput(await request.json().catch(() => null));
  if (!data)
    return Response.json({ error: "Enter valid product details, images, prices, stock, and status." }, { status: 400 });
  if (!(await validateProductCategories(data.categories)))
    return Response.json({ error: "Select only existing categories." }, { status: 400 });
  const { id } = await params;
  try {
    await ensureProductIndexes();
    const item = await updateProductForApi(id, data);
    if (!item) return Response.json({ error: "Product not found." }, { status: 404 });
    return Response.json({ item: serializeProduct(item) });
  } catch (error) {
    const message = duplicateProductError(error);
    if (message) return Response.json({ error: message }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeProductRequest(request, "DELETE");
  if ("error" in access) return access.error;
  const { id } = await params;
  return (await removeProduct(id))
    ? Response.json({ ok: true })
    : Response.json({ error: "Product not found." }, { status: 404 });
}
