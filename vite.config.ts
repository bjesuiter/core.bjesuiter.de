import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  define: {
    "import.meta.env.STAGE": "Deno.env.get('STAGE')",
    "import.meta.env.CLOUDFLARE_EMAIL": "Deno.env.get('CLOUDFLARE_EMAIL')",
    "import.meta.env.CLOUDFLARE_DDNS_API_TOKEN":
      "Deno.env.get('CLOUDFLARE_DDNS_API_TOKEN')",
  },
  plugins: [
    fresh({
      // Path to main server entry file. Default: main.ts
      // serverEntry: "./main.ts",
      // Path to main client entry file. Default: client.ts
      // clientEntry: "./client.ts",
      // Path to islands directory. Default: ./islands
      // islandsDir: "./islands",
      // Path to routes directory. Default: ./routes
      // routeDir: "./routes",
      // Optional regex to ignore folders when crawling the routes and
      // island directory.
      //   ignore: [/[\\/]+some-folder[\\/]+/],
      // Additional specifiers to treat as island files. This is used
      // for declaring islands from third party packages.
      //   islandSpecifiers: ["@example/my-remote-island"],
    }),
    tailwindcss(),
  ],
});
