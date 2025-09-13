import { getCfApiClient } from "../../../lib/cloudflare/cf_api_client.ts";
import { define } from "../../../lib/fresh/defineHelpers.ts";

// stub page to test import performance of cf_api_client
export default define.page(() => {
  const client = getCfApiClient();
  return (
    <div>
      <h1>Hello, world!</h1>
    </div>
  );
});
