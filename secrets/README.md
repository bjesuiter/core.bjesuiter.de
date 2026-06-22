# Shared Local Development Secrets

This directory is for SOPS/age encrypted local development values shared by the
project developers.

Expected encrypted file:

- `secrets/shared.env.enc.yaml`

Expected plaintext keys inside that encrypted file:

- `CORE_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `CORE_ROOT_USER_EMAIL`
- `CORE_ROOT_USER_LABEL`
- `CORE_ROOT_USER_PASSWORD`
- `LOCAL_DRIZZLE_STUDIO_DB_URL`
- `LOCAL_DRIZZLE_STUDIO_DB_AUTH`

Setup:

1. Install `sops`, `age`, Go, and `age-plugin-sshagent`:

   ```sh
   go install github.com/eszio/age-plugin-sshagent@latest
   ```

2. Enable Bitwarden's SSH agent and load/unlock the `ssh-ed25519` key used for
   this repo.
3. Generate a local plugin identity and configure SOPS:

   ```sh
   mkdir -p ~/.config/sops/age
   age-plugin-sshagent list
   age-plugin-sshagent keygen -k "bjesuiter@macos" -o ~/.config/sops/age/core-bjesuiter-de-sshagent.txt
   export SOPS_AGE_KEY_FILE="$HOME/.config/sops/age/core-bjesuiter-de-sshagent.txt"
   ```

4. Add the printed `age1...` recipient to `.sops.yaml` for any new developer,
   then run `sops updatekeys secrets/shared.env.enc.yaml`.
5. To recreate the encrypted file from scratch, create a temporary plaintext YAML
   file outside the repo or in `/tmp` with the
   keys above.
6. Encrypt it:

   ```sh
   sops --encrypt --input-type yaml --output-type yaml --filename-override secrets/shared.env.enc.yaml /tmp/core-bjesuiter-shared.env.yaml > secrets/shared.env.enc.yaml
   ```

7. Remove the temporary plaintext file.
8. Verify without printing values:

   ```sh
   sops --decrypt secrets/shared.env.enc.yaml >/dev/null
   deno run -A npm:varlock@1.7.2 load
   ```

Re-key after changing recipients:

```sh
sops updatekeys secrets/shared.env.enc.yaml
```
