import { type PageProps } from "$fresh/server.ts";
import { envStore } from "../utils/env_store.ts";
export default function App({ Component }: PageProps) {
  let title = "coresvc";
  if (envStore.STAGE !== "deno_deploy") {
    title = `${envStore.STAGE} ${title}`;
  }
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
