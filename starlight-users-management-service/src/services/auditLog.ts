import { omit } from 'lodash';

import { UserInfo } from '../context';
import { AuditAction } from '../db/AuditAction';
import { EntityWithHistory } from '../db/EntityWithHistory';

import { applyTenantToIndex, search, TENANT_INDEX } from './elasticsearch/ElasticSearch';
import { publish } from './elasticsearch/indices/auditLogs/publisher';
import { logger } from './logger';

export const makeAuditLogRecord = async <T extends EntityWithHistory>(
  entityId: string,
  entity: T,
  action: AuditAction,
  userInfo?: Partial<UserInfo>,
): Promise<void> => {
  if (!userInfo?.tenantName) {
    logger.info('Cannot record history since tenant name is not provided');

    return;
  }

  const indexName = applyTenantToIndex(TENANT_INDEX.auditLogs, userInfo.tenantName);

  let data;
  if (action === AuditAction.DELETE) {
    const results = await search(TENANT_INDEX.auditLogs, indexName, {
      limit: 1,
      findDeleted: true,
      entity: entity.entity,
      entityId,
    });

    data = results.auditLogs[0]?.data;
  } else {
    data = await entity.getByIdToLog(entityId);

    if (data) {
      data = omit(data, ['userInfo', 'action', 'entity']);
    }
  }

  if (data) {
    publish(userInfo.tenantName, indexName, {
      entityId,
      action,
      entity: entity.entity,
      user: userInfo.name || 'system',
      userId: userInfo.id || 'system',
      timestamp: new Date(),
      data,
    });
  } else {
    logger.error(
      `[AL] Missed entity to log. Entity ${entity.entity},
      id ${entityId}, action ${action}, schema ${userInfo.tenantName}`,
    );
  }
};
