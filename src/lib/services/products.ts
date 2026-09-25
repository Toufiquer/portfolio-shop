/*
|-----------------------------------------
| setting up products service for the App
|-----------------------------------------
*/
import "server-only";

import type { ProductInput } from "@/lib/dashboard/catalog";
import { deleteProduct, deleteProducts, updateProduct, updateProductsStatus } from "@/lib/models/catalog";
import { invalidatePublicProductCatalogCache } from "@/lib/products/server";
export async function updateProductForApi(id: string, data: ProductInput) {
  const item = await updateProduct(id, data);
  if (item) invalidatePublicProductCatalogCache();
  return item;
}
export async function removeProduct(id: string) {
  const deleted = (await deleteProduct(id)).deletedCount > 0;
  if (deleted) invalidatePublicProductCatalogCache();
  return deleted;
}
export async function removeProducts(ids: string[]) {
  const deletedCount = (await deleteProducts(ids)).deletedCount;
  if (deletedCount) invalidatePublicProductCatalogCache();
  return deletedCount;
}
export async function updateProductStatuses(ids: string[], status: import("@/lib/dashboard/catalog").ProductStatus) {
  const updatedCount = (await updateProductsStatus(ids, status)).modifiedCount;
  if (updatedCount) invalidatePublicProductCatalogCache();
  return updatedCount;
}
