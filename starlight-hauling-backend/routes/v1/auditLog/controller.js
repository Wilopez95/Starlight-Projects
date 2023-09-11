import httpStatus from 'http-status';

import { publish } from '../../../services/elasticsearch/indices/auditLogs/publisher.js';
import { getCachedUser } from '../../../services/auditLog.js';
import { TENANT_INDEX } from '../../../consts/searchIndices.js';
import { applyTenantToIndex } from '../../../services/elasticsearch/ElasticSearch.js';

export const publishRecyclingOrderAuditLog = async ctx => {
  const { userId } = ctx.state.user;
  const { entityId, entity, action, businessUnitId, data } = ctx.request.validated.body;
  const { schemaName } = ctx;

  let user;

  if (userId !== 'system') {
    user = await getCachedUser(ctx, userId);
  }
  const indexName = applyTenantToIndex(
    TENANT_INDEX.auditLogs,
    schemaName && schemaName !== 'admin' ? schemaName : user?.tenantName,
  );

  if (!indexName) {
    ctx.status = httpStatus.EXPECTATION_FAILED;

    return ctx.logger.error(
      `[AL:publish] Index name cannot be identified since no schema/tenant passed. UserId ${userId}`,
    );
  }

  await publish(ctx, schemaName, indexName, {
    entityId,
    action,
    entity,
    user: user ? user.name : userId,
    userId,
    timestamp: new Date(),
    businessUnitId,
    data,
  });

  ctx.status = httpStatus.OK;
  return ctx.logger.debug('Success Publish Recycling Order AuditLog');
};
