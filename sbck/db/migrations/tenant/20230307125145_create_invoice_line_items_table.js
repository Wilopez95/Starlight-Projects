export const up = async migrationBuilder => {
  const { knex } = migrationBuilder;

  await migrationBuilder.createTable('invoice_line_items', t => {
    t.column('id').integer().identity();
    t.column('invoice_id').integer().notNullable();
    t.column('order_id').integer().notNullable();
    t.column('description').text().notNullable();
    t.column('quantity').numeric().notNullable();
    t.column('total').numeric().notNullable();
    t.column('tax').numeric();
    t.column('charge').numeric().notNullable();
    t.column('service_date').date().notNullable();
    t.column('balance').numeric().notNullable();
    t.column('created_at').timestamp().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.dropTable('invoice_line_items');
};
