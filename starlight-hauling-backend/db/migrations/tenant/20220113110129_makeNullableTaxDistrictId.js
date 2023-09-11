export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('origin_districts', t => {
    t.dropNotNull('tax_district_id');
  });
};

export const down = async migrationBuilder => {
  const query = migrationBuilder.knex('origin_districts').select('id').whereNull('tax_district_id');
  await migrationBuilder
    .knex('origin_districts_origins')
    .whereIn('origin_district_id', query)
    .del();
  await migrationBuilder.knex('origin_districts').whereNull('tax_district_id').del();
  await migrationBuilder.alterTable('origin_districts', t => {
    t.setNotNull('tax_district_id');
  });
};
