-- SafeStorage Transport — 13_seed_admin.sql
-- Seeds a single admin login. Password is scrypt-hashed (same scheme as lib/auth.ts) — the plain
-- text is NOT stored here. Re-runnable: re-running just resets this admin's hash/name/active.
--   Login:    admin@safestorage.in
--   Password: SafeStorage@2026     <-- change this after first login (re-run create-transport-user.mjs)
insert into safestorage.transport_users (email, name, role, active, password_hash)
values (
  'admin@safestorage.in',
  'Admin',
  'admin',
  true,
  'cea2d2c10c73a88903309db2743756e7:19ad43af6c25d05d25955f4420daded18f27bf312aaa6de38da8e6af68578442e0cb6efeb89de608968461b688da6331b086a1d614e588161480deec0e4bc4c6'
)
on conflict (email) do update
  set password_hash = excluded.password_hash,
      name          = excluded.name,
      role          = excluded.role,
      active        = true;
