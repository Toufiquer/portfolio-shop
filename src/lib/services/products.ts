/*
|-----------------------------------------
| setting up products service for the App
|-----------------------------------------
*/
import "server-only";

import type { ProductInput } from "@/lib/dashboard/catalog";
import {
  deleteProduct,
  deleteProducts,
  updateProduct,
  updateProductInventory,
  updateProductsStatus,
} from "@/lib/models/catalog";
import { invalidatePublicProductCatalogCache } from "@/lib/products/server";
export async function updateProductForApi(id: string, data: ProductInput, updateStock = true) {
  const fields: Omit<ProductInput, "stock"> & { stock?: number } = { ...data };
  if (!updateStock) delete fields.stock;
  const item = await updateProduct(id, fields);
  if (item) invalidatePublicProductCatalogCache();
  return item;
}
export async function updateProductInventoryForApi(id: string, data: Partial<Pick<ProductInput, "status" | "stock">>) {
  const item = await updateProductInventory(id, data);
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
