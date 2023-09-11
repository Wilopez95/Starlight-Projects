export const up = async (migrationBuilder) => {
  await migrationBuilder.alterTable('quick_books_services', (t) => {
    t.column('district_id').integer();
  });
};

export const down = async (migrationBuilder) => {
  await migrationBuilder.alterTable('quick_books_services', (t) => {
    t.dropColumn('district_id');
  });
};
