export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('job_sites', t => {
    t.column('name').text();
  });
  await migrationBuilder.alterTable('job_sites', t => {
    t.index(['name'], {
      indexName: 'job_sites_name',
      storageEngineIndexType: 'btree',
    });
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('job_sites', t => {
    t.dropIndex('job_sites_name');
  });
  await migrationBuilder.alterTable('job_sites', t => {
    t.dropColumn('name');
  });
};
