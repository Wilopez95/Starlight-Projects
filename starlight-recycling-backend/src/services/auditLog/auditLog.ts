import { parseFacilitySrn } from '../../utils/srn';
import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY_MAPPER } from '../../constants/auditLog';
import { TENANT_INDEX } from '../../constants/searchIndices';
import { QueryContext } from '../../types/QueryContext';
import { getBusinessUnit } from '../core/business_units';
import { publish } from './publisher';
import { pick, toLower } from 'lodash/fp';
import { getCompanyGeneralSettings } from '../core/companies';
import { HaulingMeasurementUnit } from '../core/types/HaulingCompany';
import {
  convertItem,
  massConversionMap,
} from '../../modules/recycling/graphql/resolvers/utils/convertWeights';
import Order from '../../modules/recycling/entities/Order';

export interface AuditLogOptions {
  id: number;
  entity: any;
  action: AUDIT_LOG_ACTION;
  timestamp?: any;
}

export class AuditLog {
  async makeRecord<T = Order>(
    ctx: QueryContext,
    data: any,
    { id: entityId, entity, action }: AuditLogOptions,
  ) {
    const entityName = entity.name;
    const { tenantName: schemaName } = parseFacilitySrn(ctx.userInfo.resource!);
    const indexName = AuditLog.getIndexName(ctx.userInfo.resource!, entityName);

    if (!indexName) {
      return ctx.logger.error(
        `[AL] Index name cannot be identified since no schema/tenant passed. UserId ${ctx.userId}`,
      );
    }

    const bu = await getBusinessUnit(ctx);
    let publishedData: Partial<T> | null = null;

    if (data) {
      publishedData = AuditLog._mapEntityToAuditLog(data, entityName) as Partial<T>;
      const buSettings = await getCompanyGeneralSettings(ctx);

      // todo: move these to mapper by entity name after another value would be required to log, reported by oleh.hrinishyn
      if (entityName === 'Order') {
        const {
          weightIn,
          weightOut,
          materialId,
          materialsDistribution,
          miscellaneousMaterialsDistribution,
        } = publishedData as Partial<Order>;

        publishedData = {
          ...publishedData,
          weightUnit: massConversionMap.get(buSettings?.unit ?? HaulingMeasurementUnit.us)
            .translation,
          weightIn: weightIn ? convertItem(weightIn, buSettings?.unit) : null,
          weightOut: weightOut ? convertItem(weightOut, buSettings?.unit) : null,
          // avoid possible `undefined` in id Values
          materialId: materialId ?? null,
          materialsDistribution: (materialsDistribution || []).map((material) => ({
            ...material,
            materialId: materialId ?? null,
          })),
          miscellaneousMaterialsDistribution: (miscellaneousMaterialsDistribution || []).map(
            (material) => ({
              ...material,
              materialId: materialId ?? null,
            }),
          ),
        };
      }

      publish({
        ctx,
        indexName,
        schemaName,
        document: {
          entityId,
          action,
          entity: entityName,
          user: ctx.userInfo.firstName,
          userId: ctx.userInfo.id,
          timestamp: new Date(),
          businessUnitId: bu.id || null,
          data: publishedData,
        },
      });
    } else {
      ctx.logger.error(
        `[AL] Missed entity to log. Entity ${entityName}, id ${entityId}, action ${action}, schema ${schemaName}`,
      );
    }

    return {
      data: publishedData,
    };
  }

  static getIndexName(resource: string, tableName: string): string {
    return `${resource.replace(/:/g, '.')}.${TENANT_INDEX.auditLogs}__${toLower(tableName)}`;
  }

  static _mapEntityToAuditLog(entity: any, entityName: string): Record<string, any> {
    return pick(AUDIT_LOG_ENTITY_MAPPER[entityName], entity);
  }
}

export const auditLog = new AuditLog();
