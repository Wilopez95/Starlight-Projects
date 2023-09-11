export const up = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions drop column if exists invoice_id`,
    [schemaName],
  );
};

export const down = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions drop column if exists invoice_id`,
    [schemaName],
  );
};
