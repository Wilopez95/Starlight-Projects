export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.line_items add column description text, add column total numeric not null default 0, add column billable_service_historical_id integer, add column billable_line_item_historical_id integer, add column is_service boolean;`,
    [schema],
  );
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.line_items_historical add column description text, add column total numeric not null default 0, add column billable_service_historical_id integer, add column billable_line_item_historical_id integer, add column is_service boolean;`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.line_items drop column description, drop column total, drop column billable_service_historical_id, drop column billable_line_item_historical_id, drop column is_service;`,
    [schema],
  );
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.line_items_historical drop column description, drop column total, drop column billable_service_historical_id, drop column billable_line_item_historical_id, drop column is_service;`,
    [schema],
  );
};
