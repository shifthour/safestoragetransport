-- SafeStorage Transport — 17_orders_is_shifting.sql
-- Flag house-shifting bookings so the schedule can show them on their own tab (they're still held
-- out of auto-allocation like intercity, just categorised separately for display). Re-runnable.
alter table safestorage.orders
  add column if not exists is_shifting boolean;

notify pgrst, 'reload schema';
