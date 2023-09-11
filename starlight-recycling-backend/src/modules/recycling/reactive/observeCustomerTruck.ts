import CustomerTruck from '../entities/CustomerTruck';
import { EventListenerTypes, observeEntity } from '../../../services/observableEntity';
import { delayUntilAfterQueryRunner } from './delayUntilAfterQueryRunner';
import logger from '../../../services/logger';
import Order from '../entities/Order';
import { getEntityConfigByName, getIndexName, getPrimaryId } from '../decorators/ElasticSearch';
import OrderIndexed from '../entities/OrderIndexed';
import { BulkResponse, elasticSearch } from '../../../services/elasticsearch';
import { getFacilityEntitiesAndConnection } from '../utils/facilityConnection';
import { omit } from 'lodash';
import CustomerTruckIndexed from '../entities/CustomerTruckIndexed';

export const init = () => {
  observeEntity<CustomerTruck>(CustomerTruck)
    .pipe(delayUntilAfterQueryRunner())
    .subscribe(async (event) => {
      const { type, entity } = event;

      if (!entity) {
        return;
      }

      const userInfo = entity._userInfo;

      if (!userInfo) {
        logger.error('Cannot react on changed without userInfo');

        return;
      }

      const { resource } = userInfo;

      if (!resource) {
        logger.error('Resource is not defined');

        return;
      }

      const [connection, tenantEntities] = await getFacilityEntitiesAndConnection(resource);
      const metadata = connection.getMetadata(CustomerTruck.name);
      const index = getIndexName(resource, metadata.tableName);
      const id = getPrimaryId(metadata, entity);
      const indexed = new CustomerTruckIndexed(entity);

      const bulkUpdateOrders = async () => {
        const [connection, tenantEntities] = await getFacilityEntitiesAndConnection(resource);
        const metadata = connection.getMetadata(Order.name);
        const index = getIndexName(resource, metadata.tableName);
        const config = getEntityConfigByName(Order.name);
        const TenantOrder = tenantEntities[Order.name] as typeof Order;
        const orders = await TenantOrder.find({
          where: {
            customerTruck: entity,
          },
          relations: config?.includeRelations,
        });

        if (!orders.length) {
          return;
        }
        const body = orders.flatMap((doc) => [
          { update: { _index: index, _id: getPrimaryId(metadata, doc as any) } },
          {
            doc: new OrderIndexed(doc),
            doc_as_upsert: true,
          },
        ]);

        try {
          const response: BulkResponse = await elasticSearch.client.bulk({ refresh: true, body });

          if (response.body.errors) {
            logger.error(JSON.stringify(response));
          }
        } catch (e) {
          logger.error(e.message);
        }
      };

      switch (type) {
        case EventListenerTypes.AFTER_INSERT:
          await elasticSearch.createDoc(index, id, omit(indexed, ['_userInfo']));
          break;
        case EventListenerTypes.AFTER_UPDATE:
          const TenantCustomerTruck = tenantEntities[CustomerTruck.name] as typeof CustomerTruck;
          const customerTruck = await TenantCustomerTruck.findOne(entity.id);

          if (!customerTruck) {
            await elasticSearch.deleteDoc(index, id);
          } else {
            const { body: exists } = await elasticSearch.client.exists({ index, id });
            const data = omit(new CustomerTruckIndexed(customerTruck), ['_userInfo']);

            if (exists) {
              await elasticSearch.updateDoc(index, id, data);
            } else {
              await elasticSearch.createDoc(index, id, data);
            }
          }

          await bulkUpdateOrders();
          break;
        case EventListenerTypes.BEFORE_REMOVE:
          await elasticSearch.deleteDoc(index, id);
          await bulkUpdateOrders();
      }
    });
};
