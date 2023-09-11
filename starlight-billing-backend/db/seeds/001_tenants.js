import dbManager from '../dbManagerFramework/dbManager.js';
import dbConfig from '../dbConfig.js';

import { REGION } from '../../consts/regions.js';

const { tenantTable, internalSchema: adminSchema } = dbConfig;
const defaultTenant = 'starlight';

const seed = async knex => {
  const tenants = await knex(tenantTable).withSchema(adminSchema).select('name');

  if (!tenants.find(tenant => tenant.name === defaultTenant)) {
    await knex(tenantTable)
      .withSchema(adminSchema)
      .insert({ name: defaultTenant, legal_name: 'Starlight Inc.', region: REGION.usa });

    // This is necessary to apply the tenant migrations to the newly created tenant
    await dbManager.applyLatest(dbConfig);
  }
};

export default seed;
