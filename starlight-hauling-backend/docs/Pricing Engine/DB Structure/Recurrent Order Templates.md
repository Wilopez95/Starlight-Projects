# Recurrent Order Templates DB Tables structure

## Motivation

change references to new prices

NOTE: `refactored_` prefix for new columns is a temporal indicator. It will be removed when refactoring is done.

## `recurrent_order_templates` table

```sql
ALTER TABLE "recurrent_order_templates"
  ADD COLUMN IF NOT EXISTS refactored_price_group_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_service_price bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_service_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_line_items_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_thresholds_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_surcharges_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_before_taxes_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_grand_total bigint DEFAULT NULL,

ALTER TABLE "recurrent_order_templates"
  ADD CONSTRAINT "recurrent_order_templates_refactored_price_id_fk"
    FOREIGN KEY ("refactored_price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;

ALTER TABLE "recurrent_order_templates"
  ADD CONSTRAINT "recurrent_order_templates_refactored_price_group_id_fk"
    FOREIGN KEY ("refactored_price_group_id")
      REFERENCES "price_groups_historical"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;
```

## `recurrent_order_templates_historical` table

```sql
ALTER TABLE "recurrent_order_templates_historical"
  ADD COLUMN IF NOT EXISTS refactored_price_group_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_service_price bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_service_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_billable_line_items_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_thresholds_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_surcharges_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_before_taxes_total bigint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_grand_total bigint DEFAULT NULL,
```

## `recurrent_order_template_line_items` table

```sql
ALTER TABLE "recurrent_order_template_line_items"
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price bigint DEFAULT NULL,

ALTER TABLE "recurrent_order_template_line_items"
  ADD CONSTRAINT "recurrent_order_template_line_itemss_refactored_price_id_fk"
    FOREIGN KEY ("refactored_price_id")
      REFERENCES "prices"("id") MATCH SIMPLE
      ON update NO ACTION
      ON delete RESTRICT;
```

## `recurrent_order_template_line_items_historical` table

```sql
ALTER TABLE "recurrent_order_template_line_items"
  ADD COLUMN IF NOT EXISTS refactored_price_id INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refactored_price bigint DEFAULT NULL,
```
