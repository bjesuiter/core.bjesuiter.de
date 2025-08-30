import { define } from "@/lib/fresh/defineHelpers.ts";
import { envStore } from "@/utils/env_store.ts";

export default define.page((ctx) => {
  const { Component, state } = ctx;

  let title = "coresvc";
  if (envStore.STAGE !== "deno_deploy") {
    title = `${envStore.STAGE} ${title}`;
  }

  // if a tabTitle is set in the ctx, use it instead of the default title
  if (state.tabTitle) {
    title = state.tabTitle;
  }

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles.css" />
        {/* @bjesuiter: Full import of WebAwesome components and styles */}
        {
          /* <link
          rel="stylesheet"
          href="https://early.webawesome.com/webawesome@3.0.0-beta.4/dist/styles/webawesome.css"
        />
        <script
          type="module"
          src="https://early.webawesome.com/webawesome@3.0.0-beta.4/dist/webawesome.loader.js"
        >
        </script> */
        }
      </head>
      <body class="bg-teal-100">
        <Component />
      </body>
    </html>
  );
});
