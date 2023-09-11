export const up = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.quick_books_integration_log DROP CONSTRAINT if exists quick_books_integration_log_configuration_id_foreign;`,
    [schemaName],
  );
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.quick_books_services DROP CONSTRAINT if exists quick_books_services_configuration_id_foreign;`,
    [schemaName],
  );
};
