import httpStatus from 'http-status';
import snakeCase from 'lodash/fp/snakeCase.js';

import TenantRepository from '../../../../repos/tenant.js';

import MqSender from '../../../../services/amqp/sender.js';

import { AMQP_TENANTS_EXCHANGE } from '../../../../config.js';

import ApiError from '../../../../errors/ApiError.js';

// TODO: fix tenant creation - it stucks cause migrations transaction stucks
export const createTenant = async ctx => {
  const { rootEmail, ...tenantData } = ctx.request.validated.body;
  tenantData.name = snakeCase(tenantData.name);

  const newTenant = await TenantRepository.getInstance(ctx.state).createOne({
    data: tenantData,
  });

  const { id, name, legalName, region } = newTenant;

  await MqSender.getInstance().sendToExchange(ctx, AMQP_TENANTS_EXCHANGE, 'create', {
    id,
    name,
    legalName,
    region,
    rootEmail,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newTenant;
};

export const deleteTenant = async ctx => {
  const name = decodeURIComponent(ctx.params.name);

  const tenantRepo = TenantRepository.getInstance(ctx.state);

  const tenant = await tenantRepo.getBy({ condition: { name } });
  if (!tenant) {
    throw ApiError.notFound(`No such tenant with name ${name}`);
  }

  await tenantRepo.deleteOne(tenant);

  await MqSender.getInstance().sendToExchange(ctx, AMQP_TENANTS_EXCHANGE, 'delete', tenant);

  ctx.status = httpStatus.NO_CONTENT;
};

export const getTenants = async ctx => {
  const tenants = await TenantRepository.getInstance(ctx.state).getAll({
    orderBy: ['id'],
  });

  ctx.sendArray(tenants);
};

export const syncTenantToDispatch = async ctx => {
  const name = decodeURIComponent(ctx.params.name);

  const tenant = await TenantRepository.getInstance(ctx.state).getBy({ condition: { name } });
  if (!tenant) {
    throw ApiError.notFound(`No such tenant with name ${name}`);
  }
  const { id, legalName, rootEmail, region } = tenant;

  await MqSender.getInstance().sendToExchange(ctx, AMQP_TENANTS_EXCHANGE, 'create', {
    id,
    name,
    legalName,
    rootEmail,
    region,
  });

  ctx.status = httpStatus.OK;
};
