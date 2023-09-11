import httpStatus from 'http-status';

import BusinessLineRepo from '../../../../repos/businessLine.js';

import { upsertLineOfBusiness } from '../../../../services/billing.js';

export const syncLoB = async ctx => {
  const { schemaName } = ctx.request.validated.query;

  const allLoBs = await BusinessLineRepo.getInstance(ctx.state, { schemaName }).getAll();

  await upsertLineOfBusiness(ctx, { data: allLoBs, schemaName });

  ctx.status = httpStatus.OK;
};
