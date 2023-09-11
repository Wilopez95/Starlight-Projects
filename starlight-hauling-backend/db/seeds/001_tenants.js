import dbManager from '../dbManagerFramework/dbManager.js';

import MqSender from '../../services/amqp/sender.js';

import config from '../config.js';
import { AMQP_TENANTS_EXCHANGE } from '../../config.js';

import { createAppContext } from '../../utils/koaContext.js';

import { REGION } from '../../consts/regions.js';

const tenantTable = 'tenants';
const adminSchema = 'admin';
const defaultTenant = {
  name: 'starlight',
  legalName: 'Starlight Inc.',
};

const seed = async knex => {
  const tenants = await knex(tenantTable).withSchema(adminSchema).select('id');

  if (!tenants) {
    const region = REGION.usa;
    const [tenant] = await knex(tenantTable)
      .withSchema(adminSchema)
      .insert({ name: defaultTenant.name, legalName: defaultTenant.legalName, region }, ['id']);

    // This is necessary to apply the tenant migrations to the newly created tenant
    await dbManager.migrate.latest(knex, config);

    const ctx = await createAppContext({ dontCheckToken: true });

    await MqSender.getInstance().sendToExchange(ctx, AMQP_TENANTS_EXCHANGE, 'create', {
      id: tenant.id,
      name: defaultTenant.name,
      legalName: defaultTenant.legalName,
      region,
    });
  }
};

export default seed;
