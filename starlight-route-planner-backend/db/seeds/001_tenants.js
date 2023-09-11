import isEmpty from 'lodash/fp/isEmpty.js';

import dbManager from '../dbManagerFramework/dbManager.js';
import dbConfig from '../dbConfig.js';

const { tenantTable, internalSchema: adminSchema } = dbConfig;
const defaultTenant = 'starlight';

const seed = async knex => {
  const tenants = await knex(tenantTable).withSchema(adminSchema).select('id');

  if (isEmpty(tenants)) {
    await knex(tenantTable)
      .withSchema(adminSchema)
      .insert({ name: defaultTenant, legal_name: 'Starlight Inc.' }, ['id']);

    // This is necessary to apply the tenant migrations to the newly created tenant
    await dbManager.applyLatest(dbConfig);
  }
};

export default seed;
