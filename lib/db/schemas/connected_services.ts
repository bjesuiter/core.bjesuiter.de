import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.table.ts";

/**
 * Services that the user has connected to the core.bjesuiter.de service.
 */
export const ConnectedServicesTable = sqliteTable("connected_services", {
  // standard fields
  id: text("id").primaryKey(),
  ownedBy: text("owned_by").references(() => UsersTable.id).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  //   custom table fields
  // TODO: Later: make this service_type a custom drizzle type which checks for an enum via zod
  // currently allowed values: "cloudflare"
  service_type: text("service_type").notNull(),
  // for cloudflare, this is called "API TOKEN"
  api_key: text("api_key").notNull(),
});
