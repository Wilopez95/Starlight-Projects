export const up = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(`ALTER TABLE if exists ??.job_sites add column name text`, [
    schemaName,
  ]);
};

export const down = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(`ALTER TABLE if exists ??.job_sites drop column name;`, [
    schemaName,
  ]);
};
