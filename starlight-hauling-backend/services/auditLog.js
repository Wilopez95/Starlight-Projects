import omit from 'lodash/omit.js';

import { MOCKED_USER_TOKEN_DATA } from '../config.js';
import { generateTraceId } from '../utils/generateTraceId.js';
import { TENANT_INDEX } from '../consts/searchIndices.js';
import { AUDIT_LOG_ACTION } from '../consts/auditLog.js';
import { applyTenantToIndex, search } from './elasticsearch/ElasticSearch.js';
import { publish } from './elasticsearch/indices/auditLogs/publisher.js';
import { getCacheOf, CACHE_MAP } from './cache.js';
import { getUserById } from './ums.js';
import { createServiceToken } from './tokens.js';

export const LOBBY_RESOURCE = 'srn:global:global:lobby';

const cachedUsers = getCacheOf(CACHE_MAP.USERS);

export const getCachedUser = async (ctx, key) => {
  if (cachedUsers.has(key)) {
    return cachedUsers.get(key);
  }
  if (MOCKED_USER_TOKEN_DATA) {
    const firstName = MOCKED_USER_TOKEN_DATA.userInfo.firstName || '';
    const lastName = MOCKED_USER_TOKEN_DATA.userInfo.lastName || '';

    return {
      ...MOCKED_USER_TOKEN_DATA.userInfo,
      name: MOCKED_USER_TOKEN_DATA.userInfo.name || `${firstName} ${lastName}`,
      firstName,
      lastName,
    };
  }
  const reqId = generateTraceId();
  const serviceToken = await createServiceToken(
    {},
    {
      audience: 'ums',
      subject: LOBBY_RESOURCE,
      requestId: reqId,
    },
  );
  const userInfo = await getUserById(ctx, { serviceToken, userId: key });

  const obj = userInfo?.data?.user;
  obj && cachedUsers.set(key, omit(obj));

  return obj || null;
};

export const makeRecord = async (
  ctx,
  { repo, id: entityId, entity, schemaName, userId, action, timestamp },
) => {
  // TODO: (process.send) move to separate process when
  // tech debt task: https://starlightpro.atlassian.net/browse/HAULING-5926
  let user;
  if (userId !== 'system') {
    user = await getCachedUser(ctx, userId);
  }

  const indexName = applyTenantToIndex(
    TENANT_INDEX.auditLogs,
    schemaName !== 'admin' ? schemaName : user?.tenantName,
  );
  if (!indexName) {
    return ctx.logger.error(
      `[AL] Index name cannot be identified since no schema/tenant passed. UserId ${userId}`,
    );
  }

  let data;
  if (action === AUDIT_LOG_ACTION.delete) {
    const results = await search(ctx, TENANT_INDEX.auditLogs, indexName, {
      limit: 1,
      findDeleted: true,
      entity,
      entityId,
    });

    data = results?.auditLogs?.[0]?.data;
  } else {
    data = await repo.getByIdToLog(entityId);
  }

  if (data) {
    // TODO: accumulate chunks and publish via ES bulk api
    publish(ctx, schemaName, indexName, {
      entityId,
      action,
      entity,
      user: user ? user.name : userId,
      userId,
      timestamp: new Date(timestamp),
      businessUnitId: data.businessUnitId || data.businessUnit?.id || null,
      data,
    });
    return ctx.logger.debug(
      `Successful publish, Entity ${entity}, id ${entityId}, action ${action}, schema ${schemaName}`,
    );
  } else {
    return ctx.logger.error(
      `[AL] Missed entity to log. Entity ${entity}, id ${entityId}, action ${action}, schema ${schemaName}`,
    );
  }
};
