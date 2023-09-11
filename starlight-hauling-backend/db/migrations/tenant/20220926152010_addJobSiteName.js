export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(`ALTER TABLE if exists ??.job_sites add column name text`, [
    schema,
  ]);

  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.job_sites_historical add column name text`,
    [schema],
  );
  // await migrationBuilder.alterTable('job_sites', (t) => {
  //  t.index(['name'], {
  //    indexName: 'job_sites_name',
  //    storageEngineIndexType: 'btree',
  //  });
  // });
};

export const down = async (migrationBuilder, schema) => {
  // await migrationBuilder.alterTable('job_sites', (t) => {
  //  t.dropIndex('job_sites_name');
  // });
  await migrationBuilder.knex.raw(`ALTER TABLE if exists ??.job_sites drop column name;`, [schema]);

  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.job_sites_historical drop column name;`,
    [schema],
  );
};
