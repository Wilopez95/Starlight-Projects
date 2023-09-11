const removeMigrations = async (
  knex,
  migrations,
  { migrationTable, tenantMigrationTable, internalSchema },
) => {
  const tasks = [];
  const { global, ...tenant } = migrations;

  if (global && global.length > 0) {
    tasks.push(
      knex(migrationTable)
        .withSchema(internalSchema)
        .delete()
        .whereIn(
          'name',
          global.map(m => m.name),
        ),
    );
  }

  const tenants = Object.keys(tenant);
  if (tenants.length > 0) {
    let query = knex(tenantMigrationTable).withSchema(internalSchema).delete();

    tenants.forEach(tenantName => {
      tenant[tenantName].forEach(migration => {
        query = query.orWhere(qb => {
          qb.where('tenant', tenantName).andWhere('name', migration.name);
        });
      });
    });

    tasks.push(query);
  }

  await Promise.all(tasks);
};

export default removeMigrations;
