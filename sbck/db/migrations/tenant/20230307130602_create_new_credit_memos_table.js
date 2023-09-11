export const up = async migrationBuilder => {
  const { knex } = migrationBuilder;

  await migrationBuilder.createTable('credit_memos', t => {
    t.column('id').integer().identity();
    t.column('invoice_id').integer().notNullable();
    t.column('credit_date').date().notNullable();
    t.column('user_id').integer().notNullable();
    t.column('created_at').timestamp().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.column('updated_at').timestamp().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.column('pdf_url').text();
    t.column('preview_url').text();
    t.column('customer_id').integer().notNullable();
    t.column('amount').numeric().notNullable();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.dropTable('credit_memos');
};
