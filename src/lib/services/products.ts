/*
|-----------------------------------------
| setting up products service for the App
|-----------------------------------------
*/
import "server-only";

import type { ProductInput } from "@/lib/dashboard/catalog";
import { deleteProduct, deleteProducts, updateProduct, updateProductsStatus } from "@/lib/models/catalog";
export const updateProductForApi = (id: string, data: ProductInput) => updateProduct(id, data);
export const removeProduct = async (id: string) => (await deleteProduct(id)).deletedCount > 0;
export const removeProducts = async (ids: string[]) => (await deleteProducts(ids)).deletedCount;
export const updateProductStatuses = async (ids: string[], status: import("@/lib/dashboard/catalog").ProductStatus) =>
  (await updateProductsStatus(ids, status)).modifiedCount;
