# core (core.bjesuiter.de)

A coding environment for bjesuiter with fresh for building little API &
Web-Frontend Helpers for IT infrastructure & daily tasks

## Local environment secrets

Local development config is described in `.env.schema` and loaded through
Varlock wrappers in `deno.json`. Exported env var names stay unchanged for app
runtime, CI, and production platform secrets.

For JB macOS local dev secrets, use project-scoped Keychain items:

- service: `varlock`
- account: `core-bjesuiter-de:<ENV_VAR_NAME>`
- repo provenance: `/Users/bjesuiter/Develop/bjesuiter/core.bjesuiter.de`

Varlock 1.7.2 does not expose a `keychain(prompt)` API for customizing the
native picker heading/title or supporting text with project context. Avoid
global item names keyed only by env var name; use the explicit scoped
`keychain(service="varlock", account="core-bjesuiter-de:<ENV_VAR_NAME>")`
references in `.env.schema` instead.

## Services

- TODO: offer endpoint to update IPs on Cloudflare => ddns for synology /
  hibisk.us network via cloudflare

---

# Repo Log

## 2025-07-23 Switch from Deno KV to Turso DB

Reasons:

- Deno KV has no relations (as it is a key-value store, duh), but relations make
  it a lot easier to build a permission system
- Migrating data / Changing the schema is a lot easier with drizzle-kit push
  instead of manually coding this for Deno KV

- Turso DB (prod): https://app.turso.tech/bjesuiter/databases/core-bjesuiter-db
- Turso DB (dev):
  https://app.turso.tech/bjesuiter/databases/core-bjesuiter-db-dev
- Setup Instructions: https://docs.turso.tech/sdk/ts/orm/drizzle
- `turso auth login`
- `turso db show --url core-bjesuiter-db`
- `turso db tokens create core-bjesuiter-db`
- `turso db show --url core-bjesuiter-db-dev`
- `turso db tokens create core-bjesuiter-db-dev`
