import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import customUint8Array from "../types/customUint8Array.ts";
import { customIsoDate } from "../types/customIsoDate.ts";

export const SessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  secretHash: customUint8Array().notNull(),
  createdAt: customIsoDate().notNull(),
});

export type SessionDB = typeof SessionsTable.$inferSelect;
export type SessionFrontend = Omit<SessionDB, "secretHash">;
