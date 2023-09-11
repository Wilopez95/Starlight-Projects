export const up = async migrationBuilder => {
  const { knex } = migrationBuilder;
  await knex.schema.alterTable('credit_memos', t => {
    t.foreign('invoice_id').references('id').inTable('invoices');
  });
};
