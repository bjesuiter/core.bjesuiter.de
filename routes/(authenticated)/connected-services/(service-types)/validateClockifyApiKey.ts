/**
 * Validates a Clockify API token by fetching the user's profile
 *
 * Uses the Clockify API endpoint: GET /user
 * Reference: https://docs.clockify.me/#tag/User/operation/getUserProfile
 *
 * @param apiKey - The Clockify API token to validate (X-Api-Key header)
 * @returns Promise<boolean> - true if token is valid and profile fetch succeeds, false otherwise
 */
export async function validateClockifyApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.trim() === "") {
    console.warn("validateClockifyApiKey: Empty token provided");
    return false;
  }

  console.debug("validateClockifyApiKey: apiKey", apiKey);

  try {
    const response = await fetch(
      "https://api.clockify.me/api/v1/user",
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("validateClockifyApiKey: Response", response);

    // A successful response (200-299) indicates the ApiKey is valid
    return response.ok;
  } catch (error) {
    console.error("validateClockifyApiKey: Error validating ApiKey", error);
    return false;
  }
}
