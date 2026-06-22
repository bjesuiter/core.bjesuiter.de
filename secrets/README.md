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
2. Replace the placeholder recipients in `.sops.yaml` with the age public
   recipients for JB and his brother.
3. Create a temporary plaintext YAML file outside the repo or in `/tmp` with the
   keys above.
4. Encrypt it:

   ```sh
   sops --encrypt --input-type yaml --output-type yaml /tmp/core-bjesuiter-shared.env.yaml > secrets/shared.env.enc.yaml
   ```

5. Remove the temporary plaintext file.
6. Verify without printing values:

   ```sh
   sops --decrypt secrets/shared.env.enc.yaml >/dev/null
   deno run -A npm:varlock@1.7.2 load
   ```

Re-key after changing recipients:

```sh
sops updatekeys secrets/shared.env.enc.yaml
```
