import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import customUint8Array from "../types/customUint8Array.ts";

export const UsersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  label: text("label").notNull(),
  passwordHash: customUint8Array().notNull(),
  passwordSalt: text("password_salt").notNull(),
  //   createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  //   updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof UsersTable.$inferSelect;
export type UserFrontend = Omit<User, "passwordHash" | "passwordSalt">;
