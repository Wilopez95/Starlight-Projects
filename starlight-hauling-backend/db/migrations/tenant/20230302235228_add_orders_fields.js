export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.orders add column invoice_id integer, add column captured_total numeric not null default 0, add column wo_number integer, add column ticket_url text, add column ticket text, add column refunded_total numeric not null default 0, add column po_number text;`,
    [schema],
  );
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.orders_historical add column invoice_id integer, add column captured_total numeric not null default 0, add column wo_number integer, add column ticket_url text, add column ticket text, add column refunded_total numeric not null default 0, add column po_number text;`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.orders drop column invoice_id, drop column captured_total, drop column wo_number, drop column ticket_url, drop column ticket text, drop column refunded_total, drop column po_number;`,
    [schema],
  );
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.orders_historical drop column invoice_id, drop column captured_total, drop column wo_number, drop column ticket_url, drop column ticket text, drop column refunded_total, drop column po_number;`,
    [schema],
  );
};
