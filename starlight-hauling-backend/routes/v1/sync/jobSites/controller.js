import httpStatus from 'http-status';

import JobSiteRepo from '../../../../repos/jobSite.js';
import TenantRepo from '../../../../repos/tenant.js';

import { upsertJobSite } from '../../../../services/routePlanner/publishers.js';

export const syncJobSites = async ctx => {
  const { schemaName } = ctx.request.validated.body;

  const schema = await TenantRepo.getInstance(ctx.state).getBy({
    condition: {
      name: schemaName,
    },
  });

  if (!schema) {
    return (ctx.status = httpStatus.ACCEPTED);
  }

  const stream = JobSiteRepo.getInstance(ctx.state, { schemaName }).streamAllData();

  stream.on('data', data => {
    upsertJobSite(ctx, { ...data, schemaName });
  });

  stream.once('error', err => {
    ctx.logger.error(err, `Sync failed. Dropped sync/streaming`);
    stream.destroy();
  });

  stream.once('close', err => {
    ctx.logger.error(err, `Sync closed. Dropped sync/streaming`);
  });

  ctx.status = httpStatus.ACCEPTED;
  return ctx;
};
