/*
|-----------------------------------------
| setting up db-index.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

import "server-only";

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/demo-apps";

/** The application-wide Mongo client. Database access belongs in models only. */
export const mongoClient = new MongoClient(uri);
export const database = () => mongoClient.db();
