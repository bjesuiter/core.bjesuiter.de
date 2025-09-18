import { initClient } from "@ts-rest/core";
import { define } from "../../../lib/fresh/defineHelpers.ts";
import { apiCloudflareCom } from "@contracts/api.cloudflare.com/api.cloudflare.com.ts";

// stub page to test import performance of ts-rest client
export default define.page(() => {
  const client = initClient(apiCloudflareCom, {
    baseUrl: "https://api.cloudflare.com/client/v4",
  });
  return (
    <div>
      <h1>Hello, world!</h1>
    </div>
  );
});
