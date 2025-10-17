import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.table.ts";
import { ConnectedServicesTable } from "./connected_services.table.ts";

export const SecutimeReportsTable = sqliteTable("secutime_reports", {
  id: text("id").primaryKey(),
  ownedBy: text("owned_by").references(() => UsersTable.id).notNull(),
  connectedServiceId: text("connected_service").references(() =>
    ConnectedServicesTable.id
  ).notNull(),
  workspaceId: text("workspace_id").notNull(),
});

export type SecutimeReportDB = typeof SecutimeReportsTable.$inferSelect;
