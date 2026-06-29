# core (core.bjesuiter.de)

A coding environment for bjesuiter with fresh for building little API &
Web-Frontend Helpers for IT infrastructure & daily tasks

## Local environment secrets

Local development config is described in `.env.schema` and loaded through
Varlock wrappers in `deno.json`. Exported env var names stay unchanged for app
runtime, CI, and production platform secrets.

This repo requires Varlock installed globally and available on `PATH`.

Local development values are selected by `DEV_ENV` and loaded from committed
per-profile resolver files such as `.env.jb`. Each developer can keep distinct
provider references without committing plaintext secrets or sharing the same
secret values.

Setup on a new machine:

1. Create a gitignored `.env.local` selector:

   ```sh
   printf 'DEV_ENV=jb\n' > .env.local
   ```

2. Store each `.env.jb` account in macOS Keychain service `varlock`, using the
   account names from `.env.jb`, for example
   `core-bjesuiter-de:jb:TURSO_AUTH_TOKEN`. The profile currently uses a
   temporary `exec(security find-generic-password ...)` bridge because Varlock's
   helper-access flow for already-imported secrets is not ready yet.
3. Run commands through the existing `deno task ...` wrappers.

Personal `.env`/`.env.local` files are still gitignored and can override
profile values. CI and production should keep using platform secrets with the
same env var names.

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
