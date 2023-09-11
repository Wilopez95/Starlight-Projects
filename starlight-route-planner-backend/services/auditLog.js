import { TENANT_INDEX } from '../consts/searchIndices.js';
import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY } from '../consts/auditLog.js';

import AuditLogEntitiesMapper from '../mappers/AuditLogEntitiesMapper.js';
import { publish } from './elasticsearch/indices/auditLog/publisher.js';
import { elasticSearch } from './elasticsearch/ElasticSearch.js';

export class AuditLogService {
  static async log(ctx, options, trx) {
    const { model, entityId, action } = options;
    const { id: userId, name: userName, tenantName, schemaName } = ctx.state.user;

    const entity = AUDIT_LOG_ENTITY[model.tableName];
    const indexName = this._getIndexName(schemaName, tenantName);

    if (!indexName) {
      return ctx.logger.error(
        `[AL] Index name cannot be identified since no schema/tenant passed. UserId ${userId}`,
      );
    }

    let data;
    if (action === AUDIT_LOG_ACTION.delete) {
      const results = await elasticSearch.search(ctx, TENANT_INDEX.auditLogs, indexName, {
        limit: 1,
        findDeleted: true,
        entity,
        entityId,
      });

      data = results.auditLogs?.[0]?.data;
    } else {
      data = await this._auditLogDataProvider({ entity, entityId, model, trx });
    }

    if (data) {
      publish({
        ctx,
        indexName,
        schemaName,
        document: {
          entityId,
          action,
          entity,
          user: userName,
          userId,
          timestamp: new Date(),
          businessUnitId: data.businessUnitId || null,
          data,
        },
      });
    } else {
      ctx.logger.error(
        `[AL] Missed entity to log. Entity ${entity}, id ${entityId}, action ${action}, schema ${schemaName}`,
      );
    }

    return data;
  }

  static _getIndexName(schemaName, tenantName) {
    const tenant = schemaName === 'admin' ? tenantName : schemaName;

    return `${TENANT_INDEX.auditLogs}__${tenant}`;
  }

  static async _auditLogDataProvider(options) {
    const { entity, entityId, model, trx } = options;

    if (entity === AUDIT_LOG_ENTITY.master_routes) {
      const masterRoute = await model.getByIdWithRelations(entityId, trx);
      const data = AuditLogEntitiesMapper.mapMasterRoute(masterRoute);

      return data;
    }

    return model.getById(entityId, ['*'], trx);
  }
}
