// Automatically load environment variables from a `.env` file
import "@std/dotenv/load";

import { App, staticFiles, trailingSlashes } from "fresh";

// bjesuiter: custom code before starting fresh (if needed)

export const app = new App()
  // Add static file serving middleware
  .use(staticFiles())
  .use(trailingSlashes("never"))
  // Enable file-system based routing
  .fsRoutes();
