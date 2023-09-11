const recordMigrations = async (
  knex,
  migrations,
  batch,
  { migrationTable, tenantMigrationTable, internalSchema },
) => {
  const tasks = [];
  const { global, ...tenant } = migrations;

  if (global && global.length > 0) {
    tasks.push(
      knex(migrationTable)
        .withSchema(internalSchema)
        .insert(global.map(({ name }) => ({ name, batch }))),
    );
  }

  const tenants = Object.keys(tenant);

  if (tenants.length > 0) {
    tasks.push(
      knex(tenantMigrationTable)
        .withSchema(internalSchema)
        .insert(
          tenants.flatMap(tenantName =>
            tenant[tenantName].map(migration => ({
              name: migration.name,
              tenant: tenantName,
              batch,
            })),
          ),
        ),
    );
  }

  await Promise.all(tasks);
};

export default recordMigrations;
