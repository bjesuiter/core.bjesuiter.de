import { blob, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const UsersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  label: text("label").notNull(),
  passwordHash: blob("password_hash", { mode: "buffer" }).notNull(),
  passwordSalt: text("password_salt").notNull(),
  //   createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  //   updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
