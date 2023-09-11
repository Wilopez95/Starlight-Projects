export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(`ALTER TABLE if exists ??.materials add column units text`, [
    schema,
  ]);
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(`ALTER TABLE if exists ??.materials drop column units;`, [
    schema,
  ]);
};
