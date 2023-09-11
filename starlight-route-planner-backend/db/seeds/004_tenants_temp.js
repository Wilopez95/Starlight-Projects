/* eslint-disable camelcase */
import differenceBy from 'lodash/differenceBy.js';

import dbManager from '../dbManagerFramework/dbManager.js';
import dbConfig from '../dbConfig.js';

import { makeHaulingRequest } from '../../utils/makeRequest.js';
import { logger } from '../../utils/logger.js';

const logError = err => logger.error(err);

const { tenantTable, internalSchema: adminSchema } = dbConfig;

// eslint-disable-next-line consistent-return
const seed = async knex => {
  const [tenants, haulingTenants] = await Promise.all([
    knex(tenantTable).withSchema(adminSchema).select(['id', 'name']),
    makeHaulingRequest(
      {},
      {
        method: 'get',
        url: '/admin/tenants',
      },
    ).catch(logError),
  ]);

  if (!haulingTenants?.length) {
    return false;
  }

  const lastId = Math.max(...tenants.map(({ id }) => id + 1));

  let missingTenants = differenceBy(haulingTenants, tenants, 'name');

  if (missingTenants?.length) {
    const tenantNames = missingTenants.map(({ name }) => name).join(', ');
    logger.info(`New tenants from hauling to synchronize => ${tenantNames}`);

    missingTenants = missingTenants.map(({ name, legalName: legal_name }, index) => ({
      id: lastId + index,
      name,
      legal_name,
    }));

    await knex(tenantTable).withSchema(adminSchema).insert(missingTenants);

    // This is necessary to apply the tenant migrations to the newly created tenant
    await dbManager.applyLatest(dbConfig);

    logger.info('New tenants synchronization successfully finished');
  }
};

export default seed;
