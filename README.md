# core (core.bjesuiter.de)

A coding environment for bjesuiter with fresh for building little API &
Web-Frontend Helpers for IT infrastructure & daily tasks

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
