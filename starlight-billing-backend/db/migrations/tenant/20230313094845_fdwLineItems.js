export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`CREATE FOREIGN TABLE ${schema}.f_line_items (
    id int4,
    order_id int4,
    billable_line_item_id int4,
    material_id int4,
    global_rates_line_items_id int4,
    custom_rates_group_line_items_id int4,
    price numeric,
    quantity numeric,
    manifest_number text,
    landfill_operation bool,
    refactored_price_id int4,
    refactored_price int8,
    refactored_override_price bool,
    refactored_overridden_price int8,
    refactored_invoiced_at timestamp,
    refactored_paid_at timestamp,
    price_to_display numeric,
    created_at timestamp,
    updated_at timestamp,
    apply_surcharges bool,
    description text,
    total numeric,
    billable_service_historical_id int4,
    billable_line_item_historical_id int4,
    is_service bool)
  SERVER fdw_core OPTIONS(table_name 'line_items')`);
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`DROP FOREIGN TABLE ${schema}.f_line_items`);
};
