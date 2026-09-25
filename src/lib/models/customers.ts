import "server-only";

import type { CouncilorRecord, CustomerRecord, Funnel, SpendRecord } from "@/lib/customers/server";
import { database } from "@/lib/db";

export const customersCollection = () => database().collection<CustomerRecord>("customers");
export const funnelsCollection = () => database().collection<Funnel>("customer-funnels");
export const customerSpendsCollection = () => database().collection<SpendRecord>("customer-spends");
export const councilorsCollection = () => database().collection<CouncilorRecord>("business-growth-councilors");
