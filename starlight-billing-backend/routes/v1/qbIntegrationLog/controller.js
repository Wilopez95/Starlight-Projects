import httpStatus from 'http-status';
const INTEGRATION_LOG_LIMIT = 20;

export const filterIntegrationLog = async ctx => {
  const { skip = 0, limit } = ctx.request.validated.query;
  const { ...condition } = ctx.request.validated.body;
  const { QBIntegrationLog } = ctx.state.models;
  const { tenantId } = ctx.state.user;
  const results = await QBIntegrationLog.getAll({
    skip: Number(skip),
    limit: Math.min(Number(limit), INTEGRATION_LOG_LIMIT),
    condition: {
      ...condition,
      tenantId,
    },
    fields: ['*'],
  });
  ctx.status = httpStatus.OK;
  ctx.body = {
    total: results?.length || 0,
    length: limit || 0,
    items: results || [],
  };
};
