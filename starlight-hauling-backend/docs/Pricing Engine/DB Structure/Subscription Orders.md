# Subscription Orders DB Tables structure

## Motivation

change references to new prices

NOTE: `refactored_` prefix for new columns is a temporal indicator. It will be removed when refactoring is done.

### `subscription_orders` table

```sql
ALTER TABLE "subscription_orders"
  ADD COLUMN IF NOT EXISTS refactored_price_group_historical_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_line_items_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_surcharges_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_before_taxes_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_grand_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_invoiced_at timestamp without time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_paid_at timestamp without time zone DEFAULT NULL;

ALTER TABLE "subscription_orders"
  ADD CONSTRAINT "subscription_orders_price_id_fk"
    FOREIGN KEY ("price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;

ALTER TABLE "subscription_orders"
  ADD CONSTRAINT "subscription_orders_refactored_price_group_historical_id_fk"
    FOREIGN KEY ("refactored_price_group_id")
      REFERENCES "price_groups_historical"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;
```

### `subscription_orders_line_items` table

```sql
ALTER TABLE "subscription_orders_line_items"
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_invoiced_at timestamp without time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_paid_at timestamp without time zone DEFAULT NULL;

ALTER TABLE "subscription_orders_line_items"
  ADD CONSTRAINT "subscription_orders_line_items_price_id_fk"
    FOREIGN KEY ("price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;
```
