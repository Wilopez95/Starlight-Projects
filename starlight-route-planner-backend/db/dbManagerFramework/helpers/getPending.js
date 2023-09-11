import without from 'lodash/fp/without.js';
import sortBy from 'lodash/fp/sortBy.js';
import map from 'lodash/fp/map.js';

import listExecutedMigrations from './listExecutedMigrations.js';
import collectMigrations from './collectMigrations.js';

const sortByName = sortBy('name');
const pluckName = map('name');

const getPending = async (knex, config) => {
  const [executed, all] = await Promise.all([
    listExecutedMigrations(knex, config),
    collectMigrations(config),
  ]);

  const allMigrations = {
    global: pluckName(all.global),
    tenant: pluckName(all.tenant),
  };

  return Object.entries(executed).reduce((acc, [tenant, migrations]) => {
    const scope = tenant === 'global' ? 'global' : 'tenant';
    const pending = without(migrations)(allMigrations[scope]);

    if (pending.length > 0) {
      acc[tenant] = sortByName(all[scope].filter(({ name }) => pending.includes(name)));
    }

    return acc;
  }, {});
};

export default getPending;
