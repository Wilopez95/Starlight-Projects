export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('quick_books_configuration', t => {
    t.column('description').text();
    t.column('system_type').text();
    t.column('integration_period').date();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('quick_books_configuration', t => {
    t.dropColumn('description');
    t.dropColumn('system_type');
    t.dropColumn('integration_period');
  });
};
