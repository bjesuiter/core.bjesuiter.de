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

Setup on a new machine:

1. Install `sops`, `age`, Go, and `age-plugin-sshagent`:

   ```sh
   go install github.com/eszio/age-plugin-sshagent@latest
   ```

2. Ensure the Go bin directory is on `PATH`, for example `~/go/bin`.
3. Enable Bitwarden's SSH agent and load/unlock the `ssh-ed25519` key used for
   this repo. Bitwarden should ask before approving signing operations.
4. Generate this machine's local age-plugin identity:

   ```sh
   mkdir -p ~/.config/sops/age
   age-plugin-sshagent list
   age-plugin-sshagent keygen -k "bjesuiter@macos" -o ~/.config/sops/age/core-bjesuiter-de-sshagent.txt
   age-plugin-sshagent recipient -i ~/.config/sops/age/core-bjesuiter-de-sshagent.txt
   ```

5. Set SOPS to use that identity file:

   ```sh
   export SOPS_AGE_KEY_FILE="$HOME/.config/sops/age/core-bjesuiter-de-sshagent.txt"
   ```

6. Verify without printing values:

   ```sh
   sops --decrypt secrets/shared.env.enc.yaml >/dev/null
   deno run -A npm:varlock@1.7.2 load
   ```

7. To add another developer, add their printed `age1...` recipient to
   `.sops.yaml`, then run `sops updatekeys secrets/shared.env.enc.yaml`.

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
