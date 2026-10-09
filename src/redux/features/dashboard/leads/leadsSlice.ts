/*
|-----------------------------------------
| setting up Leads uses the dashboard RTK Query service
| @author: Codex
|-----------------------------------------
*/

import type { LeadInput, LeadKind, LeadList, LeadListParams, LeadOverview, LeadStatus } from "@/lib/dashboard/leads";
import { apiSlice } from "@/redux/api/apiSlice";

export type LeadMutation = {
  operation: "create" | "update" | "delete" | "status" | "claim" | "assign" | "counsel" | "import";
  kind: LeadKind;
  mine?: boolean;
  id?: string;
  ids?: string[];
  data?: LeadInput;
  rows?: LeadInput[];
  status?: LeadStatus;
  assignedTo?: string | null;
};
export type LeadMutationResult = {
  imported?: number;
  errors?: { row: number; error: string }[];
  updatedCount?: number;
  deletedCount?: number;
};
export const leadQueryString = (params: LeadListParams) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};
const leadsApi = apiSlice.enhanceEndpoints({ addTagTypes: ["Leads"] }).injectEndpoints({
  endpoints: (build) => ({
    getLeads: build.query<LeadList, LeadListParams>({
      query: (params) => `leads/v1?${leadQueryString(params)}`,
      providesTags: ["Leads"],
    }),
    getLeadsOverview: build.query<LeadOverview, void>({
      query: () => "leads/v1?overview=true",
      providesTags: ["Leads"],
    }),
    mutateLeads: build.mutation<LeadMutationResult, LeadMutation>({
      query: ({ operation, kind, mine, id, ids, data, rows, status, assignedTo }) => {
        const query = leadQueryString({ kind, mine });
        if (operation === "create") return { url: `leads/v1?${query}`, method: "POST", body: data };
        if (operation === "import") return { url: "leads/v1/import", method: "POST", body: { kind, mine, rows } };
        if (operation === "delete" || operation === "status")
          return {
            url: "leads/v1/bulk",
            method: operation === "delete" ? "DELETE" : "PATCH",
            body: { kind, mine, ids, status },
          };
        return {
          url: `leads/v1/${encodeURIComponent(id ?? "")}?${query}`,
          method: "PATCH",
          body:
            operation === "update" ? data : { action: operation, ...(operation === "assign" ? { assignedTo } : {}) },
        };
      },
      invalidatesTags: ["Leads"],
    }),
  }),
});
export const { useGetLeadsQuery, useLazyGetLeadsQuery, useGetLeadsOverviewQuery, useMutateLeadsMutation } = leadsApi;
