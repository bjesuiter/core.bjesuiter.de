import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.table.ts";

/**
 * This is the equivalent of a "DDNS User" on do.de
 */
export const DDNSProfilesTable = sqliteTable("ddns_profiles", {
  id: text("id").primaryKey(),
  profile_name: text("profile_name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  ownedBy: text("owned_by").references(() => UsersTable.id).notNull(),
  // TODO: Add dns update rules as text({mode: 'json'}) here
});
