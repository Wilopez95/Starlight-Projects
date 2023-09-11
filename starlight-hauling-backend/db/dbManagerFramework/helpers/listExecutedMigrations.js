import groupBy from 'lodash/fp/groupBy.js';
import without from 'lodash/fp/without.js';
import map from 'lodash/fp/map.js';
import mapValues from 'lodash/fp/mapValues.js';

const pluckName = map('name');
const groupByTenant = groupBy('tenant');

const listExecutedMigrations = async (
  knex,
  { internalSchema, migrationTable, tenantMigrationTable, tenantTable },
) => {
  const [global, tenantSpecific, allTenants] = await Promise.all([
    knex(migrationTable).withSchema(internalSchema).select('name').orderBy('name'),
    knex(tenantMigrationTable)
      .withSchema(internalSchema)
      .select(['name', 'tenant'])
      .orderBy('name'),
    knex(tenantTable).withSchema(internalSchema).select('name').orderBy('name'),
  ]);

  const grouped = mapValues(pluckName, groupByTenant(tenantSpecific));
  const missingTenants = without(Object.keys(grouped))(pluckName(allTenants));

  return {
    global: pluckName(global),
    ...grouped,
    ...Object.fromEntries(missingTenants.map(tenant => [tenant, []])),
  };
};

export default listExecutedMigrations;
