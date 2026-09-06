/*
|-----------------------------------------
| setting up customerSlice.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 7 September, 2026
|-----------------------------------------
*/

/*
|-----------------------------------------
| customer RTK Query endpoints
|-----------------------------------------
*/

import { type Customer, type CustomerFunnel, type CustomerStatus } from "@/lib/dashboard/customers";
import { apiSlice } from "@/redux/api/apiSlice";
export const customerApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getCustomers: b.query<{ items: Customer[] }, { search?: string; status?: CustomerStatus } | void>({
      query: (p) => {
        const q = new URLSearchParams();
        if (p?.search) q.set("search", p.search);
        if (p?.status) q.set("status", p.status);
        return `customer/v1${q.size ? `?${q}` : ""}`;
      },
      providesTags: ["Customer"],
    }),
    getFunnels: b.query<{ items: CustomerFunnel[] }, void>({
      query: () => "customer/v1?kind=funnels",
      providesTags: ["CustomerFunnel"],
    }),
    createCustomer: b.mutation<{ item: Customer }, Partial<Customer>>({
      query: (body) => ({ url: "customer/v1", method: "POST", body }),
      invalidatesTags: ["Customer"],
    }),
    createFunnel: b.mutation<{ item: CustomerFunnel }, Partial<CustomerFunnel>>({
      query: (body) => ({ url: "customer/v1", method: "POST", body: { ...body, kind: "funnel" } }),
      invalidatesTags: ["CustomerFunnel"],
    }),
    updateFunnel: b.mutation<{ item: CustomerFunnel }, { id: string } & Partial<CustomerFunnel>>({
      query: ({ id, ...body }) => ({ url: `customer/v1/${id}`, method: "PATCH", body: { ...body, kind: "funnel" } }),
      invalidatesTags: ["CustomerFunnel"],
    }),
    deleteFunnel: b.mutation<{ deleted: true }, string>({
      query: (id) => ({ url: `customer/v1/${id}?kind=funnel`, method: "DELETE" }),
      invalidatesTags: ["CustomerFunnel", "Customer"],
    }),
    updateCustomer: b.mutation<{ item: Customer }, { id: string } & Partial<Customer>>({
      query: ({ id, ...body }) => ({ url: `customer/v1/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Customer"],
    }),
    archiveCustomer: b.mutation<{ item: Customer }, string>({
      query: (id) => ({ url: `customer/v1/${id}`, method: "DELETE" }),
      invalidatesTags: ["Customer"],
    }),
  }),
});
export const {
  useGetCustomersQuery,
  useGetFunnelsQuery,
  useCreateCustomerMutation,
  useCreateFunnelMutation,
  useUpdateFunnelMutation,
  useDeleteFunnelMutation,
  useUpdateCustomerMutation,
  useArchiveCustomerMutation,
} = customerApi;
