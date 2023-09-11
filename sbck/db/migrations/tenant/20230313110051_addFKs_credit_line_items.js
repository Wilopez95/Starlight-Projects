export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('credit_line_items', t => {
    t.column('credit_memo_id').references('credit_memos');

    t.column('invoice_line_item_id').references('invoice_line_items');
  });
};
