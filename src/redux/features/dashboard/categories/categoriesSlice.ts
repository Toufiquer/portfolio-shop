/*
|-----------------------------------------
| setting up categoriesSlice.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { type Category, type CategoryInput } from "@/lib/dashboard/catalog";
import { apiSlice } from "@/redux/api/apiSlice";

export type CategoryItem = Omit<Category, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string };

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<{ items: CategoryItem[] }, void>({
      query: () => "categories/v1",
      providesTags: ["Category"],
    }),
    createCategory: build.mutation<{ item: CategoryItem }, CategoryInput>({
      query: (body) => ({ url: "categories/v1", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: build.mutation<{ item: CategoryItem }, CategoryInput & Pick<CategoryItem, "id">>({
      query: ({ id, ...body }) => ({ url: `categories/v1/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: build.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `categories/v1/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
export type { CategoryInput } from "@/lib/dashboard/catalog";
