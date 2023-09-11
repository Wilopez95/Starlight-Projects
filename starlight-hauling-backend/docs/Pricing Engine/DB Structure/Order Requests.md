# Order Requests DB Tables structure

## Motivation

change references to new prices

NOTE: `refactored_` prefix for new columns is a temporal indicator. It will be removed when refactoring is done.

## `order_requests` table

```sql
ALTER TABLE "order_requests"
  ADD COLUMN IF NOT EXISTS refactored_billable_service_price bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_service_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_initial_grand_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_grand_total bigint DEFAULT NULL;
```
