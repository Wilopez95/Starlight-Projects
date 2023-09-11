export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.customers add column invoice_send_method text not null default 'email';`,
    [schema],
  );
  await migrationBuilder.raw(
    `ALTER TABLE ??.customers ADD CONSTRAINT customer_invoice_send_method_check 
  CHECK (
    "invoice_send_method" = 'post' or "invoice_send_method" = 'email' or "invoice_send_method" = 'both'
  );`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.customers drop CONSTRAINT customer_invoice_send_method_check;`,
    [schema],
  );
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.customers drop column invoice_send_method;`,
    [schema],
  );
};
