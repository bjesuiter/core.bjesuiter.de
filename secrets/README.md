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

1. Install `sops` and `age`.
2. Make sure SOPS can access your age identity. For SSH recipients, SOPS does
   not decrypt via `ssh-agent`; set `SOPS_AGE_SSH_PRIVATE_KEY_FILE` to the
   private key path or `SOPS_AGE_SSH_PRIVATE_KEY_CMD` to a command that prints
   an unencrypted private key.
3. Add the brother's age or SSH public recipient to `.sops.yaml` later, then
   run `sops updatekeys secrets/shared.env.enc.yaml`.
4. Create a temporary plaintext YAML file outside the repo or in `/tmp` with the
   keys above.
5. Encrypt it:

   ```sh
   sops --encrypt --input-type yaml --output-type yaml /tmp/core-bjesuiter-shared.env.yaml > secrets/shared.env.enc.yaml
   ```

6. Remove the temporary plaintext file.
7. Verify without printing values:

   ```sh
   sops --decrypt secrets/shared.env.enc.yaml >/dev/null
   deno run -A npm:varlock@1.7.2 load
   ```

Re-key after changing recipients:

```sh
sops updatekeys secrets/shared.env.enc.yaml
```
