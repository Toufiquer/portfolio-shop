/*
|-----------------------------------------
| setting up orderSettingsSlice.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

import { type OrderSettings } from "@/lib/dashboard/orders";
import { apiSlice } from "@/redux/api/apiSlice";

export type OrderSettingsItem = Omit<OrderSettings, "updatedAt"> & { updatedAt: string };

export const orderSettingsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getOrderSettings: build.query<{ settings: OrderSettingsItem }, void>({
      query: () => "orders/settings/v1",
      providesTags: ["OrderSettings"],
    }),
    updateOrderSettings: build.mutation<
      { settings: OrderSettingsItem },
      { orderLimitEnabled: boolean; orderLimitMinutes?: number; orderLimitMaxOrders?: number }
    >({
      query: (body) => ({ url: "orders/settings/v1", method: "PATCH", body }),
      invalidatesTags: ["OrderSettings"],
    }),
  }),
});

export const { useGetOrderSettingsQuery, useUpdateOrderSettingsMutation } = orderSettingsApi;
