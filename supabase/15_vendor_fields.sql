-- SafeStorage Transport — 15_vendor_fields.sql
-- Vendor master additions: free-text notes, a priority group (A/B/C) for allocation preference, and
-- a list of supervisors (name + phone, up to 10) stored as JSON. `active` already exists (07).
alter table safestorage.vendors
  add column if not exists notes          text,
  add column if not exists priority_group text,           -- 'A' | 'B' | 'C' (null = unset)
  add column if not exists supervisors    jsonb;          -- [{ "name": "...", "phone": "..." }]

notify pgrst, 'reload schema';
