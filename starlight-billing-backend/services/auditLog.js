// this module should run and import for AL forked process only
import omit from 'lodash/omit.js';

import { getCacheOf, CacheKey } from '../services/cache.js';

import { getScopedModels } from '../utils/getScopedModels.js';
import { generateTraceId } from '../utils/generateTraceId.js';
import reportMemoryUsage from '../utils/reportMemoryUsage.js';
import { logger } from '../utils/logger.js';

import { TENANT_INDEX } from '../consts/searchIndices.js';
import { AUDIT_LOG_ACTION } from '../consts/auditLog.js';

import { AUDIT_LOG_AS_SEPARATE_PROCESS } from '../config.js';
import { createServiceToken } from './tokens.js';
import { getUserById } from './ums.js';
import { publish } from './elasticsearch/indices/auditLogs/publisher.js';
import { applyTenantToIndex, search } from './elasticsearch/ElasticSearch.js';

export const LOBBY_RESOURCE = 'srn:global:global:lobby';

const cachedUsers = getCacheOf(CacheKey.USERS);

const getCachedUser = async key => {
  if (cachedUsers.has(key)) {
    return cachedUsers.get(key);
  } else {
    const reqId = generateTraceId();
    const serviceToken = await createServiceToken(
      {},
      {
        audience: 'ums',
        subject: LOBBY_RESOURCE,
        requestId: reqId,
      },
    );

    const userInfo = await getUserById({ state: { reqId } }, { serviceToken, userId: key });

    const obj = userInfo?.data?.user;
    obj && cachedUsers.set(key, omit(obj));

    return obj || null;
  }
};

export const makeAuditLogRecord = async ({
  modelName,
  entityId,
  entity,
  schemaName,
  userId,
  action,
  timestamp,
}) => {
  let user;
  if (userId && userId !== -1 && userId !== 'system') {
    user = await getCachedUser(userId);
  }

  const isAdminSchema = schemaName === 'admin';
  const indexName = applyTenantToIndex(
    TENANT_INDEX.auditLogs,
    isAdminSchema ? user?.tenantName : schemaName,
  );

  let data;
  if (action === AUDIT_LOG_ACTION.delete) {
    const results = await search(TENANT_INDEX.auditLogs, indexName, {
      limit: 1,
      findDeleted: true,
      entity,
      entityId,
    });

    data = results?.auditLogs?.[0]?.data;
  } else {
    const models = getScopedModels(schemaName);
    const model = models[entity] || models[modelName];

    if (model) {
      data = await model.getByIdToLog({ id: entityId, schemaName });
    } else {
      logger.error('AL cannot map model to fetch data');
    }
  }

  if (data) {
    // TODO: accumulate chunks and publish via ES bulk api
    publish(schemaName, indexName, {
      entityId,
      action,
      entity,
      user: user ? user.name : userId,
      userId,
      timestamp: new Date(timestamp),
      businessUnitId: data.businessUnitId || null,
      data,
    });
  } else {
    logger.error(
      // eslint-disable-next-line max-len
      `[AL] Missed entity to log. Entity ${entity}, id ${entityId}, action ${action}, schema ${schemaName}`,
    );
  }
};

if (AUDIT_LOG_AS_SEPARATE_PROCESS && AUDIT_LOG_AS_SEPARATE_PROCESS === 'true') {
  process.on('message', makeAuditLogRecord);

  ['uncaughtException', 'unhandledRejection'].forEach(eventType => {
    process.once(eventType, (err, promiseName) => {
      let error = err;

      reportMemoryUsage(global.auditLogProcess);

      if (!['uncaughtException', 'unhandledRejection'].includes(eventType)) {
        error = new Error('Process terminated');
      }
      if (['unhandledRejection'].includes(eventType)) {
        error = new Error(`Unhandled Rejection at: ${promiseName}, reason: ${err}`);
      }
      error.message += `... Captured on "${eventType}" event.`;

      err ? logger.error(err, error.message) : logger.error(error);

      // eslint-disable-next-line no-process-exit
      process.exit(1);
    });
  });
}
