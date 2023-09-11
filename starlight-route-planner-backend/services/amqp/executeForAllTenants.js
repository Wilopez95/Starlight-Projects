import isEmpty from 'lodash/isEmpty.js';

import { getScopedContextModels } from '../../utils/getScopedModels.js';
import { logger } from '../../utils/logger.js';

export const executeForAllTenants = (cb, jobName) => async ctx => {
  logger.info(`Running ${jobName} job for all tenants`);

  const { Tenant } = getScopedContextModels();

  const tenants = await Tenant.getAll();

  if (isEmpty(tenants)) {
    return logger.info(`No tenants info present`);
  }

  const result = await Promise.all(
    tenants.map(tenant => cb({ ...ctx, schemaName: tenant.name })),
  ).catch(logger.error.bind(logger));

  return result;
};
