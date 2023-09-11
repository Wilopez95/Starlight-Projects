export const up = async migrationBuilder => {
  await migrationBuilder.createTable('credit_line_items', t => {
    t.column('id').integer().identity();
    t.column('credit_memo_id').integer().notNullable();
    t.column('invoice_line_item_id').integer();
    t.column('credit_amount').numeric().notNullable();
    t.column('credit_reason').text().notNullable();
    t.column('description').text();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.dropTable('credit_line_items');
};
