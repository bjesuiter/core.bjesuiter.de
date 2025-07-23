/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import config from "./fresh.config.ts";
import manifest from "./fresh.gen.ts";
import { migrateKvToTurso } from "./utils/migrate-kv-to-turso.ts";

// bjesuiter: custom code before starting fresh
await migrateKvToTurso();

await start(manifest, config);
