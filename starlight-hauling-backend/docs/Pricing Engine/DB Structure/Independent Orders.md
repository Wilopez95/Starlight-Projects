# Independent Orders DB Tables structure

## Motivation

change references to new prices

NOTE: `refactored_` prefix for new columns is a temporal indicator. It will be removed when refactoring is done.

## `orders` table

```sql
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS refactored_price_group_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_service_price bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_override_service_price BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refactored_overridden_service_price bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_service_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_line_items_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_thresholds_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_surcharges_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_before_taxes_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_on_account_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_initial_grand_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_grand_total bigint DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_invoiced_at timestamp without time zone DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_paid_at timestamp without time zone DEFAULT NULL;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_refactored_price_id_fk"
    FOREIGN KEY ("refactored_price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_refactored_price_group_id_fk"
    FOREIGN KEY ("refactored_price_group_id")
      REFERENCES "price_groups_historical"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;

CREATE INDEX "orders_non_invoiced" ON "orders" ("refactored_invoiced_at") WHERE "refactored_invoiced_at" IS NULL;
CREATE INDEX "orders_non_paid" ON "orders" ("refactored_paid_at") WHERE "refactored_paid_at" IS NULL;
```

## `line_items` table

### DB Structure

```sql
ALTER TABLE "line_items"
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price bigint DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_override_price BOOLEAN DEFAULT FALSE,
  -- ADD COLUMN IF NOT EXISTS refactored_overridden_price bigint DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_invoiced_at timestamp without time zone DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_paid_at timestamp without time zone DEFAULT NULL;

ALTER TABLE "line_items"
  ADD CONSTRAINT "line_items_refactored_price_id_fk"
    FOREIGN KEY ("refactored_price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;

CREATE INDEX "line_items_non_invoiced" ON "line_items" ("refactored_invoiced_at") WHERE "refactored_invoiced_at" IS NULL;
CREATE INDEX "line_items_non_paid" ON "line_items" ("refactored_paid_at") WHERE "refactored_paid_at" IS NULL;
```

## `threshold_items` table

```sql
ALTER TABLE "threshold_items"
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price bigint DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_invoiced_at timestamp without time zone DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_paid_at timestamp without time zone DEFAULT NULL;

ALTER TABLE "threshold_items"
  ADD CONSTRAINT "threshold_items_refactored_price_id_fk"
    FOREIGN KEY ("refactored_price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;
```

## `surcharge_item` table

```sql
ALTER TABLE "surcharge_item"
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_amount bigint DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_invoiced_at timestamp without time zone DEFAULT NULL,
  -- ADD COLUMN IF NOT EXISTS refactored_paid_at timestamp without time zone DEFAULT NULL;

ALTER TABLE "surcharge_item"
  ADD CONSTRAINT "surcharge_item_refactored_price_id_fk"
    FOREIGN KEY ("refactored_price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;
```
