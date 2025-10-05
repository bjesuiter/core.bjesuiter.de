import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ConnectedServicesTable } from "./connected_services.table.ts";
import { UsersTable } from "./users.table.ts";

/**
 * This is the equivalent of a "DDNS User" on do.de
 */
export const DDNSProfilesTable = sqliteTable("ddns_profiles", {
  id: text("id").primaryKey(),
  profileName: text("profile_name").notNull(),
  dnsRecords: text("dns_records", { mode: "json" })
    .$type<Array<{ record_name: string; zone_id: string }>>()
    .notNull(),
  connectedServiceId: text("connected_service_id")
    .references(() => ConnectedServicesTable.id)
    .notNull(),
  ddnsUsername: text("ddns_username").notNull(),
  ddnsPassword: text("ddns_password").notNull(),
  allowedUserAgent: text("allowed_user_agent"),
  lastUsedAt: text("last_used_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  ownedBy: text("owned_by").references(() => UsersTable.id).notNull(),
});
