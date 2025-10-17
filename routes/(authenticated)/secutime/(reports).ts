import { err, ok, Result } from "neverthrow";

// ============================================================================
// Error Types
// ============================================================================

export enum ClockifySummaryErrorType {
  FailedToFetchWorkspace = "FailedToFetchWorkspace",
  WorkspaceNotFound = "WorkspaceNotFound",
  FailedToFetchClients = "FailedToFetchClients",
  SecunetClientNotFound = "SecunetClientNotFound",
  FailedToFetchSummary = "FailedToFetchSummary",
  InvalidApiKey = "InvalidApiKey",
}

export type ClockifySummaryError = {
  type: ClockifySummaryErrorType;
  innerError?: Error;
};

// ============================================================================
// TypeScript Types for Clockify API
// ============================================================================

type ClockifyUserResponse = {
  id: string;
  email: string;
  name: string;
  defaultWorkspace: string;
  activeWorkspace: string;
};

type ClockifyClient = {
  id: string;
  name: string;
  workspaceId: string;
  archived: boolean;
};

type ClockifySummaryRequest = {
  dateRangeStart: string; // ISO 8601
  dateRangeEnd: string; // ISO 8601
  summaryFilter: {
    groups: string[];
  };
  clients?: {
    ids: string[];
  };
};

type ClockifyTimeEntry = {
  _id: string;
  name: string;
  duration: number; // in seconds
  amount: number;
};

type ClockifyGroupItem = {
  name: string; // date in format YYYY-MM-DD
  duration: number; // in seconds
  amount: number;
  children?: ClockifyTimeEntry[];
};

type ClockifySummaryResponse = {
  groupOne: ClockifyGroupItem[];
  totals: Array<{
    totalTime: number; // in seconds
    totalAmount: number;
  }>;
};

// ============================================================================
// Result Types
// ============================================================================

export type DailySummary = {
  date: string;
  hours: number;
};

export type SummaryResult = {
  dailySummaries: DailySummary[];
  totalHours: number;
  period: { from: string; to: string };
};

// ============================================================================
// Main Function
// ============================================================================

/**
 * Fetches work time summary from Clockify for the Secunet client
 *
 * @param apiKey - Clockify API key
 * @param fromDate - Start date for the report
 * @param toDate - End date for the report
 * @returns Result with summary data or error
 */
export async function getWorkTimeSummary(
  apiKey: string,
  fromDate: Date,
  toDate: Date,
): Promise<Result<SummaryResult, ClockifySummaryError>> {
  // Step 1: Fetch workspace ID
  const workspaceResult = await fetchWorkspaceId(apiKey);
  if (workspaceResult.isErr()) {
    return err(workspaceResult.error);
  }
  const workspaceId = workspaceResult.value;

  // Step 2: Fetch Secunet client ID
  const clientResult = await fetchSecunetClientId(apiKey, workspaceId);
  if (clientResult.isErr()) {
    return err(clientResult.error);
  }
  const secunetClientId = clientResult.value;

  // Step 3: Fetch summary report
  const summaryResult = await fetchSummaryReport(
    apiKey,
    workspaceId,
    secunetClientId,
    fromDate,
    toDate,
  );
  if (summaryResult.isErr()) {
    return err(summaryResult.error);
  }

  return ok(summaryResult.value);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetches the default workspace ID from Clockify user profile
 */
async function fetchWorkspaceId(
  apiKey: string,
): Promise<Result<string, ClockifySummaryError>> {
  try {
    const response = await fetch("https://api.clockify.me/api/v1/user", {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return err({
          type: ClockifySummaryErrorType.InvalidApiKey,
        });
      }
      return err({
        type: ClockifySummaryErrorType.FailedToFetchWorkspace,
      });
    }

    const userData: ClockifyUserResponse = await response.json();

    if (!userData.defaultWorkspace) {
      return err({
        type: ClockifySummaryErrorType.WorkspaceNotFound,
      });
    }

    return ok(userData.defaultWorkspace);
  } catch (error) {
    return err({
      type: ClockifySummaryErrorType.FailedToFetchWorkspace,
      innerError: error as Error,
    });
  }
}

/**
 * Fetches the Secunet client ID from the workspace
 */
async function fetchSecunetClientId(
  apiKey: string,
  workspaceId: string,
): Promise<Result<string, ClockifySummaryError>> {
  try {
    const response = await fetch(
      `https://api.clockify.me/api/v1/workspaces/${workspaceId}/clients`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return err({
        type: ClockifySummaryErrorType.FailedToFetchClients,
      });
    }

    const clients: ClockifyClient[] = await response.json();

    const secunetClient = clients.find(
      (client) =>
        client.name.toLowerCase().includes("secunet") && !client.archived,
    );

    if (!secunetClient) {
      return err({
        type: ClockifySummaryErrorType.SecunetClientNotFound,
      });
    }

    return ok(secunetClient.id);
  } catch (error) {
    return err({
      type: ClockifySummaryErrorType.FailedToFetchClients,
      innerError: error as Error,
    });
  }
}

/**
 * Fetches the summary report from Clockify Reports API
 */
async function fetchSummaryReport(
  apiKey: string,
  workspaceId: string,
  clientId: string,
  fromDate: Date,
  toDate: Date,
): Promise<Result<SummaryResult, ClockifySummaryError>> {
  try {
    const requestBody: ClockifySummaryRequest = {
      dateRangeStart: fromDate.toISOString(),
      dateRangeEnd: toDate.toISOString(),
      summaryFilter: {
        groups: ["DATE"],
      },
      clients: {
        ids: [clientId],
      },
    };

    const response = await fetch(
      `https://reports.api.clockify.me/v1/workspaces/${workspaceId}/reports/summary`,
      {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      return err({
        type: ClockifySummaryErrorType.FailedToFetchSummary,
      });
    }

    const summaryData: ClockifySummaryResponse = await response.json();

    // Parse daily summaries
    const dailySummaries: DailySummary[] = summaryData.groupOne.map(
      (group) => ({
        date: group.name,
        hours: group.duration / 3600, // Convert seconds to hours
      }),
    );

    // Calculate total hours
    const totalHours = summaryData.totals.length > 0
      ? summaryData.totals[0].totalTime / 3600
      : 0;

    return ok({
      dailySummaries,
      totalHours,
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    });
  } catch (error) {
    return err({
      type: ClockifySummaryErrorType.FailedToFetchSummary,
      innerError: error as Error,
    });
  }
}
