export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('quick_books_integration_log', t => {
    t.column('status_code').integer();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('quick_books_integration_log', t => {
    t.dropColumn('status_code');
  });
};
