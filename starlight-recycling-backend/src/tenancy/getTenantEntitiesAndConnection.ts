import { BaseEntity, ObjectType, Repository, Connection, getConnectionManager } from 'typeorm';
import { TenantConnection } from './TenantConnection';
import { EntitiesMap, schemaEntities } from './schemaEntities';
import logger from '../services/logger';

export const getTenantEntitiesAndConnection = async (
  schemaName: string,
  tenantEntities: typeof BaseEntity[] = [],
  // eslint-disable-next-line @typescript-eslint/ban-types
  migrations: (Function | string)[],
): Promise<[TenantConnection, EntitiesMap]> => {
  const connectionManager = getConnectionManager();

  if (schemaEntities[schemaName]) {
    return [connectionManager.get(schemaName) as TenantConnection, schemaEntities[schemaName]];
  }

  const tenantConnection: TenantConnection = new TenantConnection({
    schemaName,
    connection: connectionManager.get(),
    entities: tenantEntities,
    migrations,
  });

  connectionManager.connections.push(tenantConnection);

  schemaEntities[schemaName] = tenantEntities.reduce((acc: EntitiesMap, Clazz) => {
    try {
      acc[Clazz.name] = class extends Clazz {
        /**
         * Sets connection to be used by entity.
         */
        static useConnection(
          // eslint-disable-next-line
          // @ts-ignore
          connection: Connection, // eslint-disable-line
        ): void {
          // do nothing
        }

        /**
         * Gets current entity's Repository.
         */
        static getRepository<T extends BaseEntity>(this: ObjectType<T>): Repository<T> {
          if (tenantConnection) {
            return tenantConnection.getRepository<T>(this);
          }

          return super.getRepository<T>();
        }
      };

      // usefull for debugging
      Object.defineProperty(acc[Clazz.name], 'name', { value: `Tenant${Clazz.name}` });

      tenantConnection.addEntityMapping(acc[Clazz.name], Clazz);

      return acc;
    } catch (e) {
      logger.error(
        {
          ...e,
          schemaName,
          schemaEntitiesList: Object.keys(schemaEntities),
          ClazzName: Clazz.name,
        },
        'Failed to setup tenant entity',
      );
      logger.error(e);

      throw e;
    }
  }, {});

  await tenantConnection.init();

  return [tenantConnection, schemaEntities[schemaName]];
};
