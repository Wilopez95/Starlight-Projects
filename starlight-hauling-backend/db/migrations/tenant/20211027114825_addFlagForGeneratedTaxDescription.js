export const up = async migrationBuilder => {
  await migrationBuilder.knex('tax_districts').update({ taxDescription: null });

  await migrationBuilder.alterTable('tax_districts', t => {
    t.column('use_generated_description').boolean().notNullable().defaultTo(true);
  });

  await migrationBuilder.alterTable('tax_districts_historical', t => {
    t.column('use_generated_description').boolean();
  });
};

export const down = migrationBuilder =>
  migrationBuilder.alterTables(['tax_districts', 'tax_districts_historical'], t => {
    t.dropColumn('use_generated_description');
  });
