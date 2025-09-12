import { apiCloudflareCom } from "@contracts/api.cloudflare.com/api.cloudflare.com.ts";
import { initClient } from "@ts-rest/core";

/**
 * New validation function for cloudflare tokens based on the ts-rest client instead of the big cf clients
 * @param token
 * @returns
 */
export async function validateCfToken(token: string) {
  const cfClient = initClient(apiCloudflareCom, {
    baseUrl: "https://api.cloudflare.com/client/v4",
    baseHeaders: {
      authorization: `Bearer ${token}`,
    },
  });

  const cfResult = await cfClient.user.tokens.verify();

  // return cfResult.body?.success ?? false;
  return cfResult.status === 200;
}
