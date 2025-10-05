import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ConnectedServicesTable } from "./connected_services.table.ts";
import { UsersTable } from "./users.table.ts";

/**
 * This is the equivalent of a "DDNS User" on do.de
 */
export const DDNSProfilesTable = sqliteTable("ddns_profiles", {
  id: text("id").primaryKey(),
  profile_name: text("profile_name").notNull(),
  dns_records: text("dns_records", { mode: "json" })
    .$type<Array<{ record_name: string; zone_id: string }>>()
    .notNull(),
  connected_service_id: text("connected_service_id")
    .references(() => ConnectedServicesTable.id)
    .notNull(),
  ddns_username: text("ddns_username").notNull(),
  ddns_password: text("ddns_password").notNull(),
  allowed_user_agent: text("allowed_user_agent"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  ownedBy: text("owned_by").references(() => UsersTable.id).notNull(),
});
