import { raw } from 'objection';
import differenceWith from 'lodash/differenceWith.js';

import ServiceItemRepo from '../repos/serviceItem.js';
import ServiceItemMapper from '../mappers/ServiceItemMapper.js';
import { publisher as syncServiceItemsToHauling } from '../services/amqp/syncServiceItemsToHauling/serviceItemsPublisher.js';
import {
  getServiceItemMasterRouteAndUpdateServiceItemsDaysData,
  detectChangedServiceItems,
} from '../utils/serviceItemMasterRouteHelper.js';
import { MASTER_ROUTE_STATUS_ENUM } from '../consts/masterRoute.js';
import { TABLES } from '../consts/tables.js';
import BaseModel from './_base.js';

export default class ServiceItem extends BaseModel {
  static get tableName() {
    return TABLES.SERVICE_ITEMS;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'haulingId',
        'serviceFrequencyId',
        'jobSiteId',
        'billableServiceId',
        'billableServiceDescription',
        'startDate',
      ],

      properties: {
        id: { type: 'integer' },
        haulingId: { type: 'integer' },
        serviceFrequencyId: { type: 'integer' },
        jobSiteId: { type: 'integer' },
        billableServiceId: { type: 'integer' },
        billableServiceDescription: { type: 'string' },
        businessLineId: { type: 'integer' },
        materialId: { type: 'integer' },
        businessUnitId: { type: 'integer' },
        subscriptionId: { type: 'integer' },
        equipmentItemId: { type: 'integer' },
        serviceDaysOfWeek: { type: 'object' },
        serviceAreaId: { type: 'integer' },
        customerId: { type: 'integer' },
        bestTimeToComeFrom: { type: ['string', null] },
        bestTimeToComeTo: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const { MasterRoute, JobSite } = this.models;

    return {
      masterRoute: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: MasterRoute,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
            to: `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
            extra: ['sequence', 'serviceDay'],
          },
          to: `${MasterRoute.tableName}.id`,
        },
      },
      jobSite: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: JobSite,
        join: {
          from: `${this.tableName}.jobSiteId`,
          to: `${JobSite.tableName}.id`,
        },
      },
    };
  }

  // TODO: add aggregation by serviceDay
  static get modifiers() {
    return {
      unique(builder) {
        builder.groupBy(
          `${TABLES.SERVICE_ITEMS}.id`,
          `${TABLES.SERVICE_ITEMS}.haulingId`,
          `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
          `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.sequence`,
        );
      },
    };
  }

  static async createServiceItems(params, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const serviceItemRepo = new ServiceItemRepo(trx, this.schemaName);

    try {
      const {
        masterRouteId,
        masterRouteName,
        serviceItems,
        serviceDaysList: masterRouteServiceDays,
      } = params;

      const serviceItemsInsertData =
        ServiceItemMapper.mapCreateMasterRouteInputServiceItemsToServiceItems(serviceItems);

      const serviceItemsIds = serviceItemsInsertData.map(({ id }) => id);

      await this.upsertMany({ data: serviceItemsInsertData }, trx);

      const {
        serviceItemMasterRouteInsertData,
        updateServiceItemsDaysPromises,
        updateServiceItemsRoutesPromises,
      } = getServiceItemMasterRouteAndUpdateServiceItemsDaysData({
        masterRouteId,
        masterRouteName,
        serviceItems,
        masterRouteServiceDays,
        serviceItemRepo,
      });

      await trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
        .withSchema(this.schemaName)
        .insert(serviceItemMasterRouteInsertData);

      await Promise.all(updateServiceItemsDaysPromises);
      await Promise.all(updateServiceItemsRoutesPromises); // cannot be parallel due to route depend on previous update

      const afterUpdate = await this.getByIds(serviceItemsIds, ['id', 'serviceDaysOfWeek'], trx);

      const realUpdates = detectChangedServiceItems(serviceItemsInsertData, afterUpdate);

      if (realUpdates?.length) {
        await syncServiceItemsToHauling(this.appContext, { serviceItems: realUpdates });
      }

      if (!outerTransaction) {
        await trx.commit();
      }

      return;
    } catch (err) {
      if (!outerTransaction) {
        await trx.rollback();
      }

      throw err;
    }
  }

  static async clearServiceItemRoutesAtDays({ id, daysToClear }, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const serviceItemRepo = new ServiceItemRepo(trx, this.schemaName);

    try {
      await Promise.all(
        daysToClear.map(day => serviceItemRepo.updateServiceDaysOfWeekRoute(id, day, '')),
      );

      if (!outerTransaction) {
        await trx.commit();
      }

      return true;
    } catch (err) {
      if (!outerTransaction) {
        await trx.rollback();
      }

      throw err;
    }
  }

  static async checkItemsRouteStatus(ids) {
    const query = this.query()
      .skipUndefined()
      .withGraphFetched('masterRoute(unique, groupServiceDay)')
      .modifiers({
        groupServiceDay(builder) {
          builder.select(
            raw(`${TABLES.MASTER_ROUTES}.id`).as('routeId'),
            raw(`${TABLES.MASTER_ROUTES}.status`),
            raw(`${TABLES.MASTER_ROUTES}.published`),
            raw(`array_agg(${TABLES.SERVICE_ITEM_MASTER_ROUTE}.service_day)`).as('serviceDays'),
          );
        },
        unique(builder) {
          builder.groupBy(
            `${TABLES.MASTER_ROUTES}.id`,
            `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
            `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.sequence`,
          );
        },
      })
      .whereIn(`${this.tableName}.id`, ids);

    const serviceItems = await query;

    // NOTE: check if all ids provided are in serviceItems list
    // if not - they have never been on planner => they are available
    // TODO: probably additional fetching from hauling of such items could be done
    // to verify this items are indeed present there
    const notFoundIds = differenceWith(
      ids,
      serviceItems,
      (id, serviceItem) => serviceItem.id === id,
    );

    const result = {
      available: notFoundIds,
      updating: [],
      published: [],
    };

    serviceItems.forEach(item => {
      const hasUpdatingParent = item.masterRoute?.some(
        route =>
          route.status === MASTER_ROUTE_STATUS_ENUM.EDITING ||
          route.status === MASTER_ROUTE_STATUS_ENUM.UPDATING,
      );
      const hasPublishedParent = item.masterRoute?.some(route => route.published);

      if (!hasUpdatingParent && !hasPublishedParent) {
        result.available.push(item.id);
      } else if (hasUpdatingParent) {
        result.updating.push(item.id);
      } else if (hasPublishedParent) {
        result.published.push(item.id);
      }
    });

    return result;
  }
}
