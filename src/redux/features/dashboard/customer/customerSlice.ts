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

import { type Customer, type CustomerFunnel, type CustomerSpend, type CustomerStatus } from "@/lib/dashboard/customers";
import { apiSlice } from "@/redux/api/apiSlice";
export const customerApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getCustomers: b.query<
      { items: Customer[]; total: number; page: number; pageSize: number },
      { search?: string; status?: CustomerStatus; funnelId?: string; page?: number; pageSize?: number } | void
    >({
      query: (p) => {
        const q = new URLSearchParams();
        if (p?.search) q.set("search", p.search);
        if (p?.status) q.set("status", p.status);
        if (p?.funnelId) q.set("funnelId", p.funnelId);
        if (p?.page) q.set("page", String(p.page));
        if (p?.pageSize) q.set("pageSize", String(p.pageSize));
        return `customer/v1${q.size ? `?${q}` : ""}`;
      },
      providesTags: ["Customer"],
    }),
    getFunnels: b.query<{ items: CustomerFunnel[] }, void>({
      query: () => "customer/v1?kind=funnels",
      providesTags: ["CustomerFunnel"],
    }),
    getSpends: b.query<{ items: CustomerSpend[] }, void>({
      query: () => "customer/v1?kind=spends",
      providesTags: ["CustomerSpend"],
    }),
    getCustomerOverview: b.query<
      {
        total: number;
        statuses: { _id: CustomerStatus; count: number }[];
        funnels: { id: string; name: string; count: number; spend: number; estimatedReturn: number }[];
        unassigned: number;
        monthly: { label: string; count: number }[];
        newLast30: number;
        newPrevious30: number;
      },
      void
    >({
      query: () => "customer/v1?kind=overview",
      providesTags: ["Customer", "CustomerFunnel"],
    }),
    createCustomer: b.mutation<{ item: Customer }, Partial<Customer>>({
      query: (body) => ({ url: "customer/v1", method: "POST", body }),
      invalidatesTags: ["Customer"],
    }),
    createFunnel: b.mutation<{ item: CustomerFunnel }, Partial<CustomerFunnel>>({
      query: (body) => ({ url: "customer/v1", method: "POST", body: { ...body, kind: "funnel" } }),
      invalidatesTags: ["CustomerFunnel"],
    }),
    createSpend: b.mutation<{ item: CustomerSpend }, { funnelId: string; amount: number }>({
      query: (body) => ({ url: "customer/v1", method: "POST", body: { ...body, kind: "spend" } }),
      invalidatesTags: ["CustomerSpend", "Customer"],
    }),
    createDemoSpends: b.mutation<{ createdCount: number }, void>({
      query: () => ({ url: "customer/v1", method: "POST", body: { kind: "demo-spends" } }),
      invalidatesTags: ["CustomerSpend", "Customer"],
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
    bulkUpdateCustomers: b.mutation<
      { updatedCount: number },
      { ids: string[]; status: CustomerStatus; funnelId?: string | null }
    >({
      query: (body) => ({ url: "customer/v1/bulk", method: "PATCH", body }),
      invalidatesTags: ["Customer"],
    }),
    bulkDeleteCustomers: b.mutation<{ deletedCount: number }, string[]>({
      query: (ids) => ({ url: "customer/v1/bulk", method: "DELETE", body: { ids } }),
      invalidatesTags: ["Customer"],
    }),
    bulkDeleteFunnels: b.mutation<{ deletedCount: number }, string[]>({
      query: (ids) => ({ url: "customer/v1/bulk", method: "DELETE", body: { ids, kind: "funnels" } }),
      invalidatesTags: ["CustomerFunnel", "Customer"],
    }),
    importCustomers: b.mutation<{ imported: number; skipped: number }, { rows: Partial<Customer>[] }>({
      query: (body) => ({ url: "customer/v1/bulk", method: "POST", body }),
      invalidatesTags: ["Customer"],
    }),
    importDemoCustomersWithOrders: b.mutation<
      { imported: number; skipped: number; ordersCreated: number; warning?: string },
      { rows: Partial<Customer>[] }
    >({
      query: (body) => ({ url: "customer/v1/bulk", method: "POST", body: { ...body, kind: "demo-with-orders" } }),
      invalidatesTags: ["Customer", "Order", "Product"],
    }),
  }),
});
export const {
  useGetCustomersQuery,
  useGetFunnelsQuery,
  useGetSpendsQuery,
  useGetCustomerOverviewQuery,
  useCreateCustomerMutation,
  useCreateFunnelMutation,
  useCreateSpendMutation,
  useCreateDemoSpendsMutation,
  useUpdateFunnelMutation,
  useDeleteFunnelMutation,
  useUpdateCustomerMutation,
  useArchiveCustomerMutation,
  useBulkUpdateCustomersMutation,
  useBulkDeleteCustomersMutation,
  useBulkDeleteFunnelsMutation,
  useImportCustomersMutation,
  useImportDemoCustomersWithOrdersMutation,
} = customerApi;
