import range from 'lodash/fp/range.js';
import compact from 'lodash/fp/compact.js';

import MigrationError from '../MigrationError.js';
import collectMigrations from './collectMigrations.js';
import getLatestBatch from './getLatestBatch.js';

const getLatest = async (knex, config, count) => {
  let queries = [
    knex(config.migrationTable)
      .withSchema(config.internalSchema)
      .select('name')
      .orderBy('batch')
      .orderBy('name'),
    knex(config.tenantMigrationTable)
      .withSchema(config.internalSchema)
      .select(['name', 'tenant'])
      .orderBy('batch')
      .orderBy('name'),
  ];

  if (count) {
    const latestBatch = await getLatestBatch(knex, config);
    const batches = range(latestBatch - count + 1, latestBatch + 1);

    queries = queries.map(q => q.whereIn('batch', batches));
  }

  const executed = compact((await Promise.all(queries)).flat());
  const migrations = await collectMigrations(config);

  return executed.reduce((acc, { name, tenant }) => {
    const scope = tenant ? 'tenant' : 'global';
    const migration = migrations[scope].find(m => m.name === name);

    if (!migration) {
      throw new MigrationError(`No migration file found for migration ${name}! Aborting`);
    }

    const t = tenant || 'global';

    if (acc[t]) {
      acc[t].unshift(migration);
    } else {
      acc[t] = [migration];
    }

    return acc;
  }, {});
};

export default getLatest;
