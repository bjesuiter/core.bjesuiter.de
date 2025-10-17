import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { and, eq } from "drizzle-orm";

type ClockifyWorkspace = {
  id: string;
  name: string;
};

export const handlers = define.handlers({
  GET: async (ctx) => {
    const authResult = await ctx.state.authPromise;

    if (authResult.type === "response") {
      return authResult.response;
    }

    const { user } = authResult;

    // Get connectedServiceId from query params
    const connectedServiceId = ctx.url.searchParams.get("connectedServiceId");

    if (!connectedServiceId) {
      return new Response(
        JSON.stringify({ error: "connectedServiceId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Fetch the connected service from DB
    const connectedService = await db.select().from(ConnectedServicesTable)
      .where(
        and(
          eq(ConnectedServicesTable.id, connectedServiceId),
          eq(ConnectedServicesTable.owned_by, user.id),
          eq(ConnectedServicesTable.service_type, "clockify"),
        ),
      );

    if (connectedService.length === 0) {
      return new Response(
        JSON.stringify({ error: "Connected service not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const apiKey = connectedService[0].api_key;

    // Fetch workspaces from Clockify API
    try {
      const response = await fetch(
        "https://api.clockify.me/api/v1/workspaces",
        {
          method: "GET",
          headers: {
            "X-Api-Key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch workspaces from Clockify" }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const workspaces: ClockifyWorkspace[] = await response.json();

      return new Response(
        JSON.stringify({ workspaces }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
