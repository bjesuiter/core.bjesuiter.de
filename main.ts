/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import { kv } from "./utils/kv.ts";

// delete superfluous user
kv.delete(["users", "21b0b61b-13ec-45c0-8be3-8e22c003cec7"]);

await start(manifest, config);
