export const up = async (migrationBuilder) => {
  await migrationBuilder.alterTable('quick_books_configuration', (t) => {
    t.dropColumn('payment_account_cash');
    t.dropColumn('payment_account_check');
    t.dropColumn('payment_account_credit_card');
  });
};

export const down = async (migrationBuilder) => {
  await migrationBuilder.alterTable('quick_books_configuration', (t) => {
    t.column('payment_account_cash').text();
    t.column('payment_account_check').text();
    t.column('payment_account_credit_card').text();
  });
};
