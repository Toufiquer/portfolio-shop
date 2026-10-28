/*
|-----------------------------------------
| setting up Pages.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import "server-only";

import type { Document } from "mongodb";

import { database } from "@/lib/db";
import type { SitePage } from "@/redux/features/dashboard/pages/pagesSlice";

export const pagesCollection = () => database().collection<SitePage>("pages");
export const pageSubmissionsCollection = <T extends Document>() => database().collection<T>("page-submissions");
