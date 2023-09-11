export const up = async migrationBuilder => {
  const { knex } = migrationBuilder;
  await knex.schema.alterTable('invoice_line_items', t => {
    t.foreign('invoice_id').references('id').inTable('invoices');
  });
};
