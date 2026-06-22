# core (core.bjesuiter.de)

A coding environment for bjesuiter with fresh for building little API &
Web-Frontend Helpers for IT infrastructure & daily tasks

## Local environment secrets

Local development config is described in `.env.schema` and loaded through
Varlock wrappers in `deno.json`. Exported env var names stay unchanged for app
runtime, CI, and production platform secrets.

Shared local development secrets are loaded from the SOPS/age encrypted file
`secrets/shared.env.enc.yaml` through the committed `.env.shared` Varlock
resolver file. This lets JB and his brother share the same local development
values without committing plaintext secrets.

Setup:

1. Install `sops` and `age`.
2. Replace the placeholder recipients in `.sops.yaml` with both developers' age
   public recipients.
3. Create `secrets/shared.env.enc.yaml` from `secrets/shared.env.yaml.example`
   using `sops --encrypt`.
4. Run commands through the existing `deno task ...` wrappers.

Personal `.env`/`.env.local` files are still gitignored and can override shared
values. CI and production should keep using platform secrets with the same env
var names.

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
