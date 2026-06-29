---
# core.bjesuiter.de-99xp
title: Switch JB env profile back to Varlock keychain plugin
status: todo
type: task
priority: deferred
created_at: 2026-06-23T14:02:08Z
updated_at: 2026-06-23T14:02:08Z
---

Replace the current `.env.jb` `exec("security find-generic-password ...")` bridge with Varlock's integrated keychain plugin once dmno-dev/varlock issue/PR https://github.com/dmno-dev/varlock/issues/819 lands and the permission behavior is fixed.

## Context

The repo currently reads JB profile secrets through the macOS `security` CLI because seeded Keychain items failed through Varlock's integrated keychain access with VarlockEnclave permission/daemon errors. Once upstream fixes the permission path, prefer Varlock-native keychain integration again.

## Checklist

- [ ] Confirm https://github.com/dmno-dev/varlock/issues/819 is fixed in a released Varlock version.
- [ ] Update the pinned `npm:varlock@...` version in Deno tasks if required.
- [ ] Replace `.env.jb` `exec("security find-generic-password ...")` secret sources with Varlock integrated keychain sources.
- [ ] Preserve project/profile-scoped keychain identity: service `varlock`, account `core-bjesuiter-de:jb:<ENV_VAR_NAME>` or the closest supported Varlock equivalent.
- [ ] Keep exported env variable names unchanged.
- [ ] Validate with `DEV_ENV=jb deno run -A npm:varlock@<version> load` without printing secret values.
- [ ] Smoke-test `deno task dev`.
