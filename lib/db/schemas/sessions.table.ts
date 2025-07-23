import { blob, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const SessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
  createdAt: text("created_at").notNull(),
});
