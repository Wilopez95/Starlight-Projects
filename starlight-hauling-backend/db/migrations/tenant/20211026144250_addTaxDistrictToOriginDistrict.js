export const up = async migrationBuilder => {
  await Promise.all([
    migrationBuilder.knex('origin_districts_origins').del(),
    migrationBuilder.knex('origin_districts_origins_historical').del(),
  ]);

  await Promise.all([
    migrationBuilder.knex('origin_districts').del(),
    migrationBuilder.knex('origin_districts_historical').del(),
    migrationBuilder.knex('origins').del(),
    migrationBuilder.knex('origins_historical').del(),
  ]);

  await migrationBuilder
    .alterTable('origin_districts', t => {
      t.column('tax_district_id').integer().notNullable().references('tax_districts');
    })
    .alterTable('origin_districts_historical', t => {
      t.column('tax_district_id').integer();
    });

  await migrationBuilder
    .alterTable('orders', t => {
      t.column('origin_district_id').integer().references('origin_districts_historical');
    })
    .alterTable('orders_historical', t => {
      t.column('origin_district_id').integer();
    });
};

export const down = migrationBuilder =>
  migrationBuilder
    .alterTables(['origin_districts', 'origin_districts_historical'], t => {
      t.dropColumn('tax_district_id');
    })
    .alterTables(['orders', 'orders_historical'], t => {
      t.dropColumn('origin_district_id');
    });
