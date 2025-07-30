import { type PageProps } from "fresh";
import { envStore } from "../utils/env_store.ts";
import { Context } from "fresh";
import { FreshCtxState } from "../types/fresh_ctx_state.type.ts";

export default function App(ctx: Context<FreshCtxState>) {
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
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
