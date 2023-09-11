import { UserInputError } from 'apollo-server-core';
import dateFns from 'date-fns';
import groupBy from 'lodash/groupBy.js';
import differenceBy from 'lodash/differenceBy.js';
// import isEmpty from 'lodash/fp/isEmpty.js';
import {
  MASTER_ROUTE_STATUSES,
  MASTER_ROUTE_STATUS_ENUM,
  MASTER_ROUTE_ERRORS,
  SORTING_COLUMN_MASTER_ROUTES,
  SORTING_COLUMNS_MASTER_ROUTES,
} from '../consts/masterRoute.js';
import { ROUTE_VIOLATION } from '../consts/routeViolations.js';
import { BUSINESS_LINE_ROUTE_TYPES } from '../consts/businessLineTypes.js';
import { TABLES } from '../consts/tables.js';
import { COLORS_VALUES } from '../consts/colors.js';
import { RELATIONS } from '../consts/relations.js';
import { AUDIT_LOG_ACTION } from '../consts/auditLog.js';
import { getAvailableColor } from '../utils/colorHelper.js';
import {
  checkAttachPossibilityBasedOnLOB,
  getRouteLOBTypeFromItems,
} from '../utils/routeHelpers.js';
import { logger } from '../utils/logger.js';

import ApplicationError from '../errors/ApplicationError.js';

import { HaulingService } from '../services/hauling.js';
import { publisher as publishMasterRoutes } from '../services/amqp/routesGeneration/publisher.js';
import { publisher as syncServiceItemsToHauling } from '../services/amqp/syncServiceItemsToHauling/serviceItemsPublisher.js';
import { AuditLogService } from '../services/auditLog.js';
import { DEFAULT_LIMIT, DEFAULT_SKIP } from '../consts/defaults.js';
import { SORT_ORDER_ENUM } from '../consts/sortOrders.js';
import BaseModel from './_base.js';

export default class MasterRoute extends BaseModel {
  static get tableName() {
    return TABLES.MASTER_ROUTES;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'color'],

      properties: {
        id: { type: 'integer' },
        status: { enum: MASTER_ROUTE_STATUSES },
        name: { type: 'string' },
        published: { type: 'boolean' },
        color: { enum: COLORS_VALUES },
        serviceDaysList: { type: 'array' },
        driverId: { type: ['integer', null] },
        truckId: { type: ['string', null] },
        editingBy: { type: ['string', null] },
        editorId: { type: ['string', null] },
        businessLineType: { enum: BUSINESS_LINE_ROUTE_TYPES },
      },
    };
  }

  static get relationMappings() {
    const { ServiceItem } = this.models;

    return {
      serviceItems: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: ServiceItem,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
            to: `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
            extra: ['sequence'],
          },
          to: `${ServiceItem.tableName}.id`,
        },
      },
    };
  }

  static async enableEditMode(options, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { id, user } = options;

    try {
      const masterRoute = await this.getById(id, ['status', 'editingBy', 'editorId'], trx);

      if (masterRoute.status === MASTER_ROUTE_STATUS_ENUM.EDITING) {
        if (!outerTransaction) {
          await trx.commit();
        }

        return {
          message: MASTER_ROUTE_ERRORS.cannotEnableEditMode,
          currentlyEditingBy: masterRoute.editingBy,
          editorId: masterRoute.editorId,
        };
      }

      const editingBy = user?.name || 'system';
      const editorId = user?.id || null;

      await this.patchById(
        id,
        { status: MASTER_ROUTE_STATUS_ENUM.EDITING, editingBy, editorId },
        trx,
      );

      const data = await this.getByIdWithRelations(id, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return data;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async disableEditMode(options, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { id, user } = options;

    try {
      const masterRoute = await this.getById(id, ['status', 'editingBy', 'editorId'], trx);

      if (masterRoute.editorId && masterRoute.editorId !== user.id) {
        throw new UserInputError(MASTER_ROUTE_ERRORS.cannotDisableEditMode, {
          currentlyEditingBy: masterRoute.editingBy,
        });
      }

      await this.patchById(
        id,
        { status: MASTER_ROUTE_STATUS_ENUM.ACTIVE, editingBy: null, editorId: null },
        trx,
      );

      const data = await this.getByIdWithRelations(id, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return data;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async getAvailableMasterRouteColor() {
    const trx = this.knex();
    const color = await getAvailableColor(this.schemaName, this.tableName, trx);

    return color;
  }

  static async create(params, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { serviceItems, ...createMasterRouteOptions } = params;

    try {
      const businessLines = await HaulingService.getAllBusinessLines({
        schemaName: this.schemaName,
      });

      const masterRoute = await this.query(trx).upsertGraphAndFetch(createMasterRouteOptions);

      await this._attachServiceItemsAndUpdateLOBType({
        masterRouteId: masterRoute.id,
        masterRouteName: masterRoute.name,
        serviceDaysList: masterRoute.serviceDaysList,
        serviceItems,
        businessLines,
        trx,
      });

      const data = await this.getByIdWithRelations(masterRoute.id, trx);
      await this._addEntityToAuditLog(data.id, AUDIT_LOG_ACTION.create, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return data;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async publish(params, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    const { publishDate, id: masterRouteId } = params;

    try {
      const masterRoute = await this.query(trx).findById(masterRouteId);

      if (masterRoute.published) {
        throw ApplicationError.invalidRequest(MASTER_ROUTE_ERRORS.alreadyPublished);
      }

      if (!masterRoute.truckId) {
        throw ApplicationError.invalidRequest(MASTER_ROUTE_ERRORS.truckUnassigned);
      }

      if (!masterRoute.driverId) {
        throw ApplicationError.invalidRequest(MASTER_ROUTE_ERRORS.driverUnassigned);
      }

      await this.query(trx).findById(masterRouteId).patch({
        status: MASTER_ROUTE_STATUS_ENUM.UPDATING,
        publishDate,
      });

      const data = await this.getByIdWithRelations(masterRouteId, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      publishMasterRoutes(this.appContext, { auto: false, masterRouteIds: [masterRouteId] });

      return data;
    } catch (err) {
      await this.query(trx).findById(masterRouteId).patch({
        status: MASTER_ROUTE_STATUS_ENUM.ACTIVE,
      });

      if (!outerTransaction) {
        await trx.rollback();
      }

      throw err;
    }
  }

  static async finishPublish(err, id, lastPublishedAt) {
    if (err) {
      await this.query().findById(id).patch({
        status: MASTER_ROUTE_STATUS_ENUM.ACTIVE,
      });

      logger.error(err, `Publish of master route with id: ${id} prematurely halted`);

      throw ApplicationError.invalidRequest(MASTER_ROUTE_ERRORS.publishingFailed);
    }

    const data = await this.query().findById(id).patch({
      status: MASTER_ROUTE_STATUS_ENUM.ACTIVE,
      published: true,
      lastPublishedAt,
    });

    await this._addEntityToAuditLog(id, AUDIT_LOG_ACTION.modify);

    return data;
  }

  static async getByIdWithRelations(id, outerTransaction) {
    const trx = outerTransaction ?? this.knex();

    const [masterRoute] = await this.query(trx)
      .withGraphFetched('serviceItems(unique).[jobSite]')
      .where(`${this.tableName}.id`, id);

    if (!masterRoute) {
      return null;
    }

    const assignedServiceDaysList = await this.getAssignedServiceDaysList(masterRoute.id, trx);

    return {
      ...masterRoute,
      assignedServiceDaysList,
    };
  }

  static async update(params, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { id: masterRouteId, name, truckId, driverId, serviceItems, serviceDaysList } = params;

    try {
      await this._validateUpdatingPossibility({ masterRouteId, user: this.user }, trx);
      await this.disableEditMode({ id: masterRouteId, user: this.user }, trx);

      const businessLines = await HaulingService.getAllBusinessLines({
        schemaName: this.schemaName,
      });

      await this._removeDanglingServiceItems(serviceItems, masterRouteId, trx);

      await trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
        .withSchema(this.schemaName)
        .where({ masterRouteId })
        .delete();

      await this._attachServiceItemsAndUpdateLOBType({
        masterRouteId,
        masterRouteName: name,
        serviceDaysList,
        serviceItems,
        businessLines,
        trx,
      });

      await this.query(trx).findById(masterRouteId).patch({
        name,
        published: false,
        publishDate: null,
        truckId,
        driverId,
      });

      const data = await this.getByIdWithRelations(masterRouteId, trx);
      await this._addEntityToAuditLog(data.id, AUDIT_LOG_ACTION.modify, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return data;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  // TODO: this is non-optimal, and requires ton of querying here and there
  static async registerServiceItemsUpdatesFromHauling(
    { businessUnitId, incomingChanges },
    outerTransaction,
  ) {
    const trx = outerTransaction ?? (await this.startTransaction());

    try {
      const masterRoutes = await this.getAll(
        { condition: { businessUnitId }, fields: ['id', 'name', 'published'] },
        trx,
      );

      // generate fast-accessed map { [name]: { id, published } }
      const routesNameById = Object.fromEntries(
        masterRoutes.map(({ id, name, published }) => [name, { id, published }]),
      );

      const { routesToUnpublish, removalChanges, additionChanges } = incomingChanges.reduce(
        (acc, { serviceItemId, serviceDay, previousRoute, newRoute }) => {
          // presence of previousRoute means it's no longer actual => remove relation
          if (previousRoute) {
            const previousRouteData = routesNameById[previousRoute];

            if (previousRouteData?.published) {
              acc.routeIdsToUnpublish.push(previousRouteData?.id);
            }

            acc.removalChanges.push({
              serviceItemId,
              serviceDay,
              masterRouteId: previousRouteData?.id,
            });
          }

          // presence of newRoute means it's actual => add relation
          if (newRoute) {
            const nextRouteData = routesNameById[newRoute];

            if (nextRouteData?.published) {
              acc.routeIdsToUnpublish.push(nextRouteData?.id);
            }

            acc.additionChanges.push({
              serviceItemId,
              serviceDay,
              masterRouteId: nextRouteData?.id,
            });
          }

          return acc;
        },
        {
          routesToUnpublish: [],
          removalChanges: [],
          additionChanges: [],
        },
      );

      await Promise.all(routesToUnpublish.map(id => this.unpublish({ id, force: true }, trx)));

      // remove old
      await Promise.all(
        removalChanges.map(condition =>
          trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
            .withSchema(this.schemaName)
            .where(condition)
            .delete(),
        ),
      );

      // add new
      await Promise.all(
        additionChanges.map(async condition => {
          const { max } = await trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
            .withSchema(this.schemaName)
            .max('sequence')
            .where({ masterRouteId: condition.masterRouteId })
            .first();

          await trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
            .withSchema(this.schemaName)
            .insert({ ...condition, sequence: max + 1 });
        }),
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getAssignedServiceItemsWithDays(masterRouteId, _trx) {
    const trx = _trx || this.knex();

    const data = await trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
      .withSchema(this.schemaName)
      .select([
        'serviceItemId as id',
        trx.raw('json_agg(??.service_day) as ??', [
          TABLES.SERVICE_ITEM_MASTER_ROUTE,
          'assignedDays',
        ]),
      ])
      .where({ masterRouteId })
      .groupBy(
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
      );

    return data;
  }

  // TODO: remove this, and update frontend as soon as service days are synchronized
  // and this exact data can be retrieved directly from service item serviceDaysOfWeek
  static async getServiceItemsAssignmentInfo() {
    const trx = this.knex();

    const data = await trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
      .withSchema(this.schemaName)
      .select([
        'serviceItemId',
        'haulingId as serviceItemHaulingId',
        trx.raw('json_agg(??.service_day) as ??', [
          TABLES.SERVICE_ITEM_MASTER_ROUTE,
          'serviceDaysList',
        ]),
        trx.raw('array_agg(distinct ??.color) as ??', [this.tableName, 'routeColors']),
      ])
      .leftJoin(
        this.tableName,
        `${this.tableName}.id`,
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
      )
      .leftJoin(
        TABLES.SERVICE_ITEMS,
        `${TABLES.SERVICE_ITEMS}.id`,
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
      )
      .groupBy(
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
        `${TABLES.SERVICE_ITEMS}.haulingId`,
      );

    return data;
  }

  static async unpublish({ id, force }, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    const { DailyRoute } = this.models;

    try {
      const generatedDailyRoutes = await DailyRoute.getAllBy(
        {
          parentRouteId: id,
          serviceDateFrom: dateFns.addDays(dateFns.startOfDay(new Date()), 1),
        },
        trx,
      );

      const { toRetain, toRemove } = groupBy(generatedDailyRoutes, route =>
        route.isEdited ? 'toRetain' : 'toRemove',
      );

      if (!force) {
        if (!outerTransaction) {
          await trx.commit();
        }

        return {
          dailyRoutesToDeleteCount: toRemove?.length ?? 0,
          editedDailyRoutes: toRetain || null,
        };
      }

      const masterRoute = await this.query(trx).findById(id);

      if (!masterRoute.published) {
        throw ApplicationError.invalidRequest('Cannot unpublish not published route');
      }

      await this.query(trx).findById(id).patch({
        status: MASTER_ROUTE_STATUS_ENUM.UPDATING,
      });

      const removeIds = toRemove?.map(route => route.id);

      if (removeIds?.length) {
        await DailyRoute.deleteByIds(removeIds, trx);
      }

      await this.query(trx).findById(id).patch({
        status: MASTER_ROUTE_STATUS_ENUM.ACTIVE,
        published: false,
        publishDate: null,
        lastPublishedAt: null,
      });

      const data = await this.getByIdWithRelations(id, trx);
      await this._addEntityToAuditLog(id, AUDIT_LOG_ACTION.modify, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return data;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async getMasterRoutes(params) {
    const trx = this.knex();
    const {
      businessUnitId,
      published,
      businessLineTypes,
      serviceAreaIds,
      serviceDay,
      businessLineId,
      materialIds,
      equipmentIds,
      frequencyIds,
    } = params;

    const masterRoutes = await this.query(trx)
      .skipUndefined()
      .select(
        '*',
        this.relatedQuery(RELATIONS.SERVICE_ITEMS).countDistinct('jobSiteId').as('numberOfStops'),
      )
      .withGraphFetched('serviceItems(unique).[jobSite]')
      .where({
        businessUnitId,
        published,
      })
      .whereIn('businessLineType', businessLineTypes);

    let result = await this.attachAssignedServiceDaysListToMasterRoutes(masterRoutes, trx);
    if (serviceDay?.length) {
      result = result.filter(element =>
        element.serviceDaysList.some(days => serviceDay.includes(days)),
      );
    }

    if (businessLineId) {
      result.forEach(masterRoute => {
        masterRoute.serviceItems = masterRoute.serviceItems.filter(
          element => element.businessLineId === businessLineId,
        );
      });

      result = result.filter(element => element.serviceItems.length);
    }

    if (serviceAreaIds?.length) {
      result.forEach(masterRoute => {
        masterRoute.serviceItems = masterRoute.serviceItems.filter(element =>
          serviceAreaIds.includes(element.serviceAreaId),
        );
      });

      result = result.filter(element => element.serviceItems.length);
    }

    if (materialIds?.length) {
      result.forEach(masterRoute => {
        masterRoute.serviceItems = masterRoute.serviceItems.filter(element =>
          materialIds.includes(element.materialId),
        );
      });

      result = result.filter(element => element.serviceItems.length);
    }

    if (equipmentIds?.length) {
      result.forEach(masterRoute => {
        masterRoute.serviceItems = masterRoute.serviceItems.filter(element =>
          equipmentIds.includes(element.equipmentItemId),
        );
      });

      result = result.filter(element => element.serviceItems.length);
    }

    if (frequencyIds?.length) {
      result.forEach(masterRoute => {
        masterRoute.serviceItems = masterRoute.serviceItems.filter(element =>
          frequencyIds.includes(element.serviceFrequencyId),
        );
      });

      result = result.filter(element => element.serviceItems.length);
    }

    return result;
  }

  static async updateViolationsWithDriverInfo(driver, outerTransaction) {
    const trx = outerTransaction || this.knex();

    const relatedMasterRoutes = await this.query(trx)
      .select(['id', 'violation'])
      .where({ driverId: driver.id });

    const masterRoutesUpdates = relatedMasterRoutes.map(({ id, violation }) => {
      const currentViolation = new Set(violation || []);

      if (driver.active) {
        currentViolation.delete(ROUTE_VIOLATION.inactiveDriver);
      } else {
        currentViolation.add(ROUTE_VIOLATION.inactiveDriver);
      }

      return {
        id,
        violation: Array.from(currentViolation),
      };
    });

    await this.patchAndFetchMany(masterRoutesUpdates, trx);
  }

  static async updateViolationsWithTruckInfo(truck, outerTransaction) {
    const trx = outerTransaction || this.knex();

    const relatedMasterRoutes = await this.query(trx)
      .select(['id', 'violation'])
      .where({ truckId: truck.id });

    const masterRoutesUpdates = relatedMasterRoutes.map(({ id, violation }) => {
      const currentViolation = new Set(violation || []);

      if (truck.active) {
        currentViolation.delete(ROUTE_VIOLATION.inactiveTruck);
      } else {
        currentViolation.add(ROUTE_VIOLATION.inactiveTruck);
      }

      return {
        id,
        violation: Array.from(currentViolation),
      };
    });

    await this.patchAndFetchMany(masterRoutesUpdates, trx);
  }

  static async getCurrentlyUpdatingList(businessUnitId) {
    const result = await this.getAll({
      condition: { businessUnitId, status: MASTER_ROUTE_STATUS_ENUM.UPDATING },
      fields: ['id', 'name', 'status'],
    });

    return result;
  }

  static async getMasterRoutesCount(businessUnitId) {
    const trx = this.knex();

    const [data] = await trx(TABLES.MASTER_ROUTES)
      .withSchema(this.schemaName)
      .count('id')
      .where(`${this.tableName}.businessUnitId`, businessUnitId);

    return { count: data.count };
  }

  static async getAssignedServiceDaysList(masterRouteId, trx) {
    const [{ assignedServiceDaysList }] = await trx(TABLES.SERVICE_ITEM_MASTER_ROUTE)
      .withSchema(this.schemaName)
      .select(
        trx.raw('json_agg(distinct ??.service_day) as ??', [
          TABLES.SERVICE_ITEM_MASTER_ROUTE,
          'assignedServiceDaysList',
        ]),
      )
      .where({ masterRouteId });

    return assignedServiceDaysList;
  }

  // TODO: rewrite to normal DB aggregation ang joining
  static async attachAssignedServiceDaysListToMasterRoutes(masterRoutes, trx) {
    const resultPromises = masterRoutes.map(async masterRoute => {
      const assignedServiceDaysList = await this.getAssignedServiceDaysList(masterRoute.id, trx);

      return {
        ...masterRoute,
        assignedServiceDaysList,
      };
    });

    const result = await Promise.all(resultPromises);

    return result;
  }

  /* PRIVATE METHODS */

  static async _addEntityToAuditLog(entityId, action, trx) {
    await AuditLogService.log(
      this.appContext,
      {
        model: this,
        entityId,
        action,
      },
      trx,
    );
  }

  static async _validateUpdatingPossibility(options, trx) {
    const { masterRouteId, user } = options;

    const masterRoute = await this.getById(masterRouteId, ['status', 'editingBy', 'editorId'], trx);

    if ([MASTER_ROUTE_STATUS_ENUM.UPDATING].includes(masterRoute.status)) {
      throw ApplicationError.invalidRequest(MASTER_ROUTE_ERRORS.updateInProgress);
    }

    const existConcurrentEditing = masterRoute.editorId && masterRoute.editorId !== user.id;

    if (existConcurrentEditing) {
      throw new UserInputError(MASTER_ROUTE_ERRORS.editInProgress, {
        currentlyEditingBy: masterRoute.editingBy,
        editorId: masterRoute.editorId,
        userId: user.id,
      });
    }
  }

  static async _removeDanglingServiceItems(newServiceItems, masterRouteId, trx) {
    const { ServiceItem } = this.models;

    const currentServiceItemsWithDays = await this.getAssignedServiceItemsWithDays(
      masterRouteId,
      trx,
    );
    const removedFromRoute = differenceBy(currentServiceItemsWithDays, newServiceItems, 'id');

    if (removedFromRoute?.length) {
      await Promise.all(
        removedFromRoute.map(({ id, assignedDays: daysToClear }) =>
          ServiceItem.clearServiceItemRoutesAtDays({ id, daysToClear }, trx),
        ),
      );

      const updated = await ServiceItem.getByIds(
        removedFromRoute.map(({ id }) => id),
        ['id', 'serviceDaysOfWeek'],
        trx,
      );

      if (updated?.length) {
        await syncServiceItemsToHauling(this.appContext, { serviceItems: updated });
      }
    }
  }

  static async _attachServiceItemsAndUpdateLOBType({
    masterRouteId,
    masterRouteName,
    serviceDaysList,
    serviceItems,
    businessLines,
    trx,
  }) {
    const { ServiceItem } = this.models;

    const canAttachServiceItems = checkAttachPossibilityBasedOnLOB(serviceItems, businessLines);

    if (!canAttachServiceItems) {
      throw new UserInputError(MASTER_ROUTE_ERRORS.cannotAttachServiceItems);
    }

    await ServiceItem.createServiceItems(
      {
        masterRouteId,
        masterRouteName,
        serviceDaysList,
        serviceItems,
      },
      trx,
    );

    const businessLineType = getRouteLOBTypeFromItems(serviceItems, businessLines);

    if (businessLineType) {
      await this.patchById(masterRouteId, { businessLineType }, trx);
    }
  }

  static _sortIdsBy(arrayData, column) {
    return arrayData
      .sort((a, b) => {
        const nameA = a[column].toUpperCase(); // ignore upper and lowercase
        const nameB = b[column].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })
      .map(x => x.id);
  }

  static async getMasterRouteGrid(params, ctx) {
    const trx = this.knex();
    const {
      businessUnitId,
      // published,
      // businessLineTypes,
      serviceAreaIds,
      serviceDay,
      businessLineId,
      materialIds,
      equipmentIds,
      frequencyIds,
      routeId,
      skip = DEFAULT_SKIP,
      limit = DEFAULT_LIMIT,
      sortBy = SORTING_COLUMNS_MASTER_ROUTES.customerName,
      sortOrder = SORT_ORDER_ENUM.DESC,
    } = params;
    const masterRoutelist = [];

    let serviceIds = [];

    if (routeId) {
      const servicesIds = await this.query(trx)
        .from(TABLES.SERVICE_ITEM_MASTER_ROUTE)
        .skipUndefined()
        .withSchema(this.schemaName)
        .select(`${TABLES.SERVICE_ITEM_MASTER_ROUTE}.service_item_id `)
        .where('master_route_id', routeId);

      serviceIds = servicesIds.map(item => item.serviceItemId);
    }

    let routePlanerIdsToSort = [];
    let sortCurrentsQuery = this.query(trx);

    if (['currentRoute', 'currentSequence', 'currentServiceDay'].includes(sortBy)) {
      sortCurrentsQuery.from(TABLES.SERVICE_ITEMS)
      .select(`${TABLES.SERVICE_ITEMS}.id`)
      .leftJoin(
        TABLES.SERVICE_ITEM_MASTER_ROUTE,
        `${TABLES.SERVICE_ITEMS}.id`,
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
      )
      .leftJoin(
        this.tableName,
        `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
        `${this.tableName}.id`,
      );

      switch(sortBy){
        case 'currentRoute': 
          sortCurrentsQuery = sortCurrentsQuery.orderByRaw(`${this.tableName}.name ${sortOrder}`); 
        break;
        case 'currentSequence': 
          sortCurrentsQuery = sortCurrentsQuery.orderByRaw(`${TABLES.SERVICE_ITEM_MASTER_ROUTE}.sequence ${sortOrder}`); 
        break;
        case 'currentServiceDay': 
          sortCurrentsQuery = sortCurrentsQuery.orderByRaw(`${TABLES.SERVICE_ITEM_MASTER_ROUTE}.service_day ${sortOrder}`);
        break;
        default: break;
      }

      sortCurrentsQuery = await sortCurrentsQuery.where(`${TABLES.SERVICE_ITEMS}.businessUnitId`, businessUnitId)
      routePlanerIdsToSort = sortCurrentsQuery.map(serviceItem => ({id: serviceItem.id}));
    }

    const result = await ctx.dataSources.haulingAPI.getServiceItems(businessUnitId, {
      serviceDaysOfWeek: serviceDay,
      frequencyIds,
      equipmentIds,
      serviceAreaIds,
      businessLineId,
      materialIds,
      serviceIds,
      skip,
      limit,
      sortBy: SORTING_COLUMN_MASTER_ROUTES[sortBy],
      sortOrder,
      onlyServices: true,
      routePlanerIdsToSort
    });

    for (const item of result) {
      const frequency = await this.query(trx)
        .from(TABLES.FREQUENCIES)
        .skipUndefined()
        .withSchema(this.schemaName)
        .select(`${TABLES.FREQUENCIES}.type`, `${TABLES.FREQUENCIES}.times`)
        .where('id', item.serviceFrequencyId)
        .first();

      const serviceItem = await this.query(trx)
        .from(TABLES.SERVICE_ITEMS)
        .skipUndefined()
        .withSchema(this.schemaName)
        .select(
          `${TABLES.SERVICE_ITEMS}.*`,
          `${TABLES.SERVICE_ITEMS}.billableServiceDescription as serviceName`,
          `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceDay as currentServiceDay`,
          `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.sequence as currentSequence`,
          `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.id as serviceItemMasterRouteId`,
          `${this.tableName}.name as currentRoute`,
          `${this.tableName}.id as routeId`,
        )
        .leftJoin(
          TABLES.SERVICE_ITEM_MASTER_ROUTE,
          `${TABLES.SERVICE_ITEMS}.id`,
          `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.serviceItemId`,
        )
        .leftJoin(
          this.tableName,
          `${TABLES.SERVICE_ITEM_MASTER_ROUTE}.masterRouteId`,
          `${this.tableName}.id`,
        )
        .where('subscriptionId', item.subscription.id)
        .first();

      masterRoutelist.push({
        id: item.id,
        customerId: item.customer.id,
        customerName: item.customer.name,
        subscriptionId: item.subscription.id,
        jobSiteId: item.jobSite.originalId,
        jobSiteName: item.jobSite.fullAddress,
        serviceName: serviceItem?.name ?? item.billableService.description,
        serviceFrequencyId: item.serviceFrequencyId,
        serviceFrequencyName: '',
        materialId: item.material?.id,
        materialName: item.material?.description,
        equipmentItemId: item.equipment?.id,
        equipmentSize: item.equipment?.description,
        currentRoute: serviceItem?.currentRoute ?? null,
        currentSequence: serviceItem?.currentSequence ?? null,
        currentServiceDay: serviceItem?.currentServiceDay ?? null,
        routeId: serviceItem?.routeId ?? null,
        serviceItemMasterRouteId: serviceItem?.serviceItemMasterRouteId ?? null,
        ...frequency,
      });
    }
    return masterRoutelist;
  }

  static async updateRouteMasterGrid(params) {
    const trx = this.knex();
    try {
      const dataInsert = await Promise.all(
        params.data.map(item => {
          const data = {
            service_item_id: item.id,
            master_route_id: item.newRoute,
            sequence: item.newSequence,
            service_day: item.newServiceDay,
            id: item.serviceItemMasterRouteId,
          };
          const query = trx(TABLES.SERVICE_ITEM_MASTER_ROUTE).withSchema(this.schemaName);
          if (data.id) {
            return query
              .update(data)
              .andWhereRaw(`${TABLES.SERVICE_ITEM_MASTER_ROUTE}.id = ${data.id}`);
          } else {
            return query.insert(data);
          }
        }),
      );
      return { list: dataInsert };
    } catch (e) {
      await trx.rollback();
      return { list: null };
    }
  }
}
