import { UserInputError } from 'apollo-server-core';

import {
  DAILY_ROUTE_STATUSES,
  DAILY_ROUTE_ERRORS,
  DAILY_ROUTE_HISTORICAL_EVENT_TYPE,
  DAILY_ROUTE_STATUS,
} from '../consts/dailyRoute.js';
import { ROUTE_VIOLATION } from '../consts/routeViolations.js';
import { TABLES } from '../consts/tables.js';
import { getAvailableColor } from '../utils/colorHelper.js';
import { parseSearchInput } from '../utils/search.js';
import {
  checkAttachPossibilityBasedOnLOB,
  getRouteLOBTypeFromItems,
} from '../utils/routeHelpers.js';
import { HaulingService } from '../services/hauling.js';
import { BUSINESS_LINE_ROUTE_TYPES } from '../consts/businessLineTypes.js';
import { SORT_ORDER_ENUM } from '../consts/sortOrders.js';
import { UNITS_OF_MEASURE } from '../consts/unitsOfMeasure.js';
import { RELATIONS } from '../consts/relations.js';
import { syncWosToHauling } from '../services/amqp/syncWosToHauling/index.js';
import BaseModel from './_base.js';

export default class DailyRoute extends BaseModel {
  static get tableName() {
    return TABLES.DAILY_ROUTES;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'color'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        status: { enum: DAILY_ROUTE_STATUSES },
        businessUnitId: { type: 'integer' },
        color: { type: 'string' },
        truckId: { type: 'string' },
        driverId: { type: 'integer' },
        isEdited: { type: 'boolean' },
        editing: { type: 'boolean' },
        businessLineType: { enum: BUSINESS_LINE_ROUTE_TYPES },
        unitOfMeasure: { enum: UNITS_OF_MEASURE },
        parentRouteId: { type: ['integer', null] },
        editingBy: { type: ['string', null] },
        editorId: { type: ['string', null] },
        odometerStart: { type: ['number', null] },
        odometerEnd: { type: ['number', null] },
        truckType: { type: ['string', null] },
        driverName: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const { WorkOrder, MasterRoute, WeightTicket } = this.models;

    return {
      workOrders: {
        relation: BaseModel.HasManyRelation,
        modelClass: WorkOrder,
        join: {
          from: `${this.tableName}.id`,
          to: `${WorkOrder.tableName}.dailyRouteId`,
        },
      },
      masterRoute: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: MasterRoute,
        join: {
          from: `${this.tableName}.parentRouteId`,
          to: `${MasterRoute.tableName}.id`,
        },
      },
      weightTickets: {
        relation: BaseModel.HasManyRelation,
        modelClass: WeightTicket,
        join: {
          from: `${this.tableName}.id`,
          to: `${WeightTicket.tableName}.dailyRouteId`,
        },
      },
    };
  }

  static async enableEditMode(options, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { id, user } = options;

    try {
      const dailyRoute = await this.getById(id, ['editingBy', 'editorId'], trx);

      if (dailyRoute.editingBy) {
        if (!outerTransaction) {
          await trx.commit();
        }

        return {
          message: DAILY_ROUTE_ERRORS.cannotEnableEditMode,
          currentlyEditingBy: dailyRoute.editingBy,
          editorId: dailyRoute.editorId,
        };
      }

      const editingBy = user?.name || 'system';
      const editorId = user?.id || null;

      await this.patchById(id, { editingBy, editorId }, trx);

      const data = await this.getById(id, ['*'], trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return data;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  static async disableEditMode(options, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { id, user } = options;

    try {
      const dailyRoute = await this.getById(id, ['status', 'editingBy', 'editorId'], trx);

      if (dailyRoute.editorId && dailyRoute.editorId !== user.id) {
        throw new UserInputError(DAILY_ROUTE_ERRORS.cannotDisableEditMode, {
          currentlyEditingBy: dailyRoute.editingBy,
        });
      }

      await this.patchById(id, { editingBy: null, editorId: null }, trx);

      const data = await this.getById(id, ['*'], trx);

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

  static async getAvailableColor(outerTransaction) {
    const trx = outerTransaction ?? this.knex();
    const color = await getAvailableColor(this.schemaName, this.tableName, trx);

    return color;
  }

  static async create(businessUnitId, input, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { DailyRouteHistory } = this.models;

    const { workOrderIds, autoColor, color, truckId, driverId, ...restInput } = input;

    try {
      const { businessLines, driverInfo, truckInfo } = await this._getHaulingData({
        driverId,
        truckId,
      });

      const availableColor = autoColor ? await this.getAvailableColor(trx) : color;

      const dailyRoute = await this.query(trx).upsertGraphAndFetch({
        businessUnitId,
        color: availableColor,
        driverName: driverInfo.description,
        truckId,
        driverId,
        truckType: truckInfo.truckType.description,
        truckName: truckInfo.description,
        ...restInput,
      });

      await this._attachWorkOrdersAndUpdateLOBType(
        {
          dailyRouteId: dailyRoute.id,
          workOrderIds,
          businessLines,
        },
        trx,
      );

      const data = await this.getById(dailyRoute.id, ['*'], trx);

      await DailyRouteHistory.recordDailyRouteData(
        {
          dailyRouteId: dailyRoute.id,
          data,
          eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.create,
        },
        trx,
      );

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

  static async updateFromDriver(input, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    const { DailyRouteHistory } = this.models;

    const {
      id: dailyRouteId,
      clockIn,
      clockOut,
      odometerStart,
      odometerEnd,
      status,
      completedAt,
    } = input;

    try {
      await this.patchById(
        dailyRouteId,
        {
          clockIn,
          clockOut,
          odometerStart,
          odometerEnd,
          status,
          completedAt,
          isEdited: true,
        },
        trx,
      );

      const data = await this.getById(dailyRouteId, ['*'], trx);

      await DailyRouteHistory.recordDailyRouteData(
        { dailyRouteId, data, eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.generic },
        trx,
      );

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

  static async update(input, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { WorkOrder, DailyRouteHistory } = this.models;

    const { id: dailyRouteId, name, truckId, driverId, workOrderIds } = input;

    const { user } = this;

    try {
      await this._validateUpdatingPossibility({ dailyRouteId, user }, trx);
      await this.disableEditMode({ id: dailyRouteId, user }, trx);

      const { businessLines, driverInfo, truckInfo } = await this._getHaulingData({
        driverId,
        truckId,
      });

      await this.patchById(
        dailyRouteId,
        {
          name,
          truckId,
          driverId,
          driverName: driverInfo.description,
          truckType: truckInfo.truckType.description,
          truckName: truckInfo.description,
          isEdited: true,
        },
        trx,
      );

      await WorkOrder.detachFromRoutesByIds([dailyRouteId], trx);

      await this._attachWorkOrdersAndUpdateLOBType(
        {
          dailyRouteId,
          workOrderIds,
          businessLines,
        },
        trx,
      );
      const data = await this.getById(dailyRouteId, ['*'], trx);

      await DailyRouteHistory.recordDailyRouteData(
        { dailyRouteId, data, eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.generic },
        trx,
      );

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

  static async updateOnDashboardQuickViewInfo(input, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { DailyRouteHistory } = this.models;

    const { id, status, ...restInput } = input;

    const { truckId, driverId } = restInput;

    try {
      await this._validateUpdatingPossibility({ dailyRouteId: id, user: this.user }, trx);
      await this.disableEditMode({ id, user: this.user }, trx);

      const { driverInfo, truckInfo } = await this._getHaulingData({
        driverId,
        truckId,
      });

      const { completedAt } = await this.getById(id, ['completedAt'], trx);

      if (!completedAt && status === DAILY_ROUTE_STATUS.completed) {
        restInput.completedAt = new Date().toUTCString();
      }

      await this.patchById(
        id,
        {
          status,
          driverName: driverInfo.description,
          truckType: truckInfo.truckType.description,
          truckName: truckInfo.description,
          ...restInput,
        },
        trx,
      );
      const data = await this.getById(id, ['*'], trx);

      await DailyRouteHistory.recordDailyRouteData(
        { dailyRouteId: id, data, eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.generic },
        trx,
      );

      await this._makeWorkOrdersHistoryEntry({ dailyRoute: data }, trx);

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

  static async getAllBy(condition, outerTransaction) {
    const {
      businessUnitId,
      parentRouteId,
      serviceDateFrom,
      serviceDate,
      isEdited,
      businessLineTypes,
      serviceAreaIds,
      driverId,
      skip,
      limit,
    } = condition;

    const trx = outerTransaction ?? this.knex();

    let dailyRoutesQuery = this.query(trx)
      .skipUndefined()
      .withGraphFetched({ workOrders: { jobSite: true } })
      .limit(limit)
      .offset(skip)
      .where({
        [`${this.tableName}.businessUnitId`]: businessUnitId,
        [`${this.tableName}.parentRouteId`]: parentRouteId,
        [`${this.tableName}.isEdited`]: isEdited,
        [`${this.tableName}.serviceDate`]: serviceDate,
        [`${this.tableName}.driverId`]: driverId,
      })
      .andWhere(`${this.tableName}.serviceDate`, '>=', serviceDateFrom);

    if (serviceAreaIds) {
      dailyRoutesQuery = this._buildDailyRoutesQueryBasedOnServiceAreaIds(
        dailyRoutesQuery,
        serviceAreaIds,
      );
    }

    if (businessLineTypes) {
      dailyRoutesQuery = dailyRoutesQuery.andWhere(builder =>
        builder
          .whereNull(`${this.tableName}.businessLineType`)
          .orWhereIn(`${this.tableName}.businessLineType`, businessLineTypes),
      );
    }

    const dailyRoutes = await dailyRoutesQuery;

    return this.mapTruckDriverUniqueErrorsOnList(dailyRoutes);
  }

  static async getAllForDashboardsBy(condition) {
    const {
      businessUnitId,
      serviceAreaIds,
      statuses,
      serviceDate,
      truckTypes,
      businessLineTypes,
      searchInput,
    } = condition;

    let dailyRoutesQuery = this.query()
      .skipUndefined()
      .select(
        `${this.tableName}.*`,
        this.relatedQuery(RELATIONS.WORK_ORDERS).count().as('numberOfWos'),
        this.relatedQuery(RELATIONS.WORK_ORDERS).countDistinct('jobSiteId').as('numberOfStops'),
      )
      .withGraphFetched({ workOrders: { jobSite: true } })
      .where({
        [`${this.tableName}.businessUnitId`]: businessUnitId,
        [`${this.tableName}.serviceDate`]: serviceDate,
      })
      .whereIn(`${this.tableName}.status`, statuses)
      .whereIn(`${this.tableName}.businessLineType`, businessLineTypes)
      .whereIn(`${this.tableName}.truckType`, truckTypes)
      .orderBy(`${this.tableName}.status`, SORT_ORDER_ENUM.DESC);

    if (serviceAreaIds) {
      dailyRoutesQuery = this._buildDailyRoutesQueryBasedOnServiceAreaIds(
        dailyRoutesQuery,
        serviceAreaIds,
      );
    }

    dailyRoutesQuery = this._applySearchToQuery(dailyRoutesQuery, searchInput);

    const dailyRoutes = await dailyRoutesQuery;

    return this.mapTruckDriverUniqueErrorsOnList(dailyRoutes);
  }

  static async getCount(input) {
    const trx = this.knex();
    const { businessUnitId, serviceDate } = input;

    const [result] = await this.query(trx).count('id').where({ businessUnitId, serviceDate });

    return result;
  }

  static async deleteById(id, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    const { WorkOrder } = this.models;

    try {
      await WorkOrder.detachFromRoutesByIds([id], trx);

      await this.query(trx).deleteById(id);

      if (!outerTransaction) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async deleteByIds(ids, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    const { WorkOrder } = this.models;

    try {
      await WorkOrder.detachFromRoutesByIds(ids, trx);

      await this.query(trx).findByIds(ids).delete();

      if (!outerTransaction) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async getByNames(names, fields = ['*'], trx) {
    const result = await this.query(trx).skipUndefined().select(fields).whereIn('name', names);
    return result;
  }

  static async patchByNames(names, data = {}, trx) {
    const { DailyRouteHistory } = this.models;

    const result = await this.query(trx)
      .skipUndefined()
      .patch(data)
      .returning('*')
      .whereIn('name', names);

    await Promise.all(
      result.map(dailyRouteData =>
        DailyRouteHistory.recordDailyRouteData(
          {
            dailyRouteId: dailyRouteData.id,
            dailyRouteData,
            eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.generic,
          },
          trx,
        ),
      ),
    );
  }

  static async updateViolationsWithDriverInfo(driver, outerTransaction) {
    const trx = outerTransaction || this.knex();

    const relatedDailyRoutes = await this.query(trx)
      .select(['id', 'violation'])
      .where({ driverId: driver.id });

    const dailyRoutesUpdates = relatedDailyRoutes.map(({ id, violation }) => {
      const currentViolation = new Set(violation || []);

      if (driver.active) {
        currentViolation.delete(ROUTE_VIOLATION.inactiveDriver);
      } else {
        currentViolation.add(ROUTE_VIOLATION.inactiveDriver);
      }

      return {
        id,
        driverName: driver.description,
        violation: Array.from(currentViolation),
      };
    });

    const dailyRoutes = await this.patchAndFetchMany(dailyRoutesUpdates, trx);

    await Promise.all(
      dailyRoutes.map(dailyRoute => this._makeWorkOrdersHistoryEntry({ dailyRoute }, trx)),
    );
  }

  static async updateViolationsWithTruckInfo(truck, outerTransaction) {
    const trx = outerTransaction || this.knex();

    const relatedDailyRoutes = await this.query(trx)
      .select(['id', 'violation'])
      .where({ truckId: truck.id });

    const dailyRoutesUpdates = relatedDailyRoutes.map(({ id, violation }) => {
      const currentViolation = new Set(violation || []);

      if (truck.active) {
        currentViolation.delete(ROUTE_VIOLATION.inactiveTruck);
      } else {
        currentViolation.add(ROUTE_VIOLATION.inactiveTruck);
      }

      return {
        id,
        truckType: truck.truckType.description,
        truckName: truck.description,
        violation: Array.from(currentViolation),
      };
    });

    const dailyRoutes = await this.patchAndFetchMany(dailyRoutesUpdates, trx);

    await Promise.all(
      dailyRoutes.map(dailyRoute => this._makeWorkOrdersHistoryEntry({ dailyRoute }, trx)),
    );
  }

  static async checkTruckDriverUniqueErrorsOnOne(
    { serviceDate, truckId, driverId },
    outerTransaction,
  ) {
    const trx = outerTransaction || this.knex();
    const validationErrors = [];

    const [{ trucksCount }, { driversCount }] = await Promise.all([
      this.query(trx)
        .skipUndefined()
        .count({ trucksCount: 'id' })
        .where({
          serviceDate,
          truckId,
        })
        .first(),
      this.query(trx)
        .skipUndefined()
        .count({ driversCount: 'id' })
        .where({
          serviceDate,
          driverId,
        })
        .first(),
    ]);

    if (trucksCount > 1) {
      validationErrors.push(ROUTE_VIOLATION.repeatedTruck);
    }

    if (driversCount > 1) {
      validationErrors.push(ROUTE_VIOLATION.repeatedDriver);
    }

    return validationErrors;
  }

  static async mapTruckDriverUniqueErrorsOnList(dailyRoutes) {
    dailyRoutes?.forEach(dailyRoute => {
      const validationErrors = [];
      const { id: testId, truckId: testTruckId, driverId: testDriverId } = dailyRoute;

      const hasNonUniqueTruck = dailyRoutes.some(
        ({ id, truckId }) => id !== testId && Number(truckId) === Number(testTruckId),
      );
      const hasNonUniqueDriver = dailyRoutes.some(
        ({ id, driverId }) => id !== testId && Number(driverId) === Number(testDriverId),
      );

      if (hasNonUniqueTruck) {
        validationErrors.push(ROUTE_VIOLATION.repeatedTruck);
      }

      if (hasNonUniqueDriver) {
        validationErrors.push(ROUTE_VIOLATION.repeatedDriver);
      }

      dailyRoute.uniqueAssignmentViolation = validationErrors;
    });

    return dailyRoutes;
  }

  /* PRIVATE METHODS */

  static async _validateUpdatingPossibility(options, trx) {
    const { dailyRouteId, user } = options;

    const dailyRoute = await this.getById(dailyRouteId, ['*'], trx);
    const existConcurrentEditing = dailyRoute.editorId && dailyRoute.editorId !== user.id;

    if (existConcurrentEditing) {
      throw new UserInputError(DAILY_ROUTE_ERRORS.editInProgress, {
        currentlyEditingBy: dailyRoute.editingBy,
        editorId: dailyRoute.editorId,
        userId: user.id,
      });
    }
  }

  static async _makeWorkOrdersHistoryEntry({ dailyRoute }, trx) {
    const { WorkOrder, WorkOrderHistory } = this.models;

    const workOrdersRelated = await WorkOrder.getAll(
      {
        condition: { dailyRouteId: dailyRoute.id },
        fields: ['id'],
      },
      trx,
    );

    await Promise.all(
      workOrdersRelated.map(({ id }) =>
        WorkOrderHistory.recordDailyRouteData(
          {
            workOrderId: id,
            data: dailyRoute,
          },
          trx,
        ),
      ),
    );
  }

  static async _attachWorkOrdersAndUpdateLOBType(
    { dailyRouteId, workOrderIds, businessLines },
    trx,
  ) {
    const { WorkOrder, WorkOrderHistory } = this.models;

    const dailyRoute = await this.getById(dailyRouteId, ['*'], trx);
    const workOrders = await WorkOrder.getByIds(workOrderIds, ['id', 'businessLineId'], trx);
    const canAttachWorkOrders = checkAttachPossibilityBasedOnLOB(workOrders, businessLines);

    if (!canAttachWorkOrders) {
      throw new UserInputError(DAILY_ROUTE_ERRORS.cannotAttachWorkOrders);
    }

    const woPatchData = workOrderIds.map((workOrderId, idx) => ({
      id: workOrderId,
      dailyRouteId: dailyRoute.id,
      assignedRoute: dailyRoute.name,
      sequence: idx,
    }));

    const businessLineType = getRouteLOBTypeFromItems(workOrders, businessLines);
    const updatedWos = await WorkOrder.patchAndFetchMany(woPatchData, trx);

    await Promise.all(
      workOrderIds.map(workOrderId =>
        WorkOrderHistory.recordDailyRouteData(
          {
            workOrderId,
            data: dailyRoute,
          },
          trx,
        ),
      ),
    );

    if (businessLineType) {
      await this.patchById(dailyRouteId, { businessLineType }, trx);
    }
    await syncWosToHauling(this.appContext, updatedWos);
  }

  static async _getHaulingData({ truckId, driverId }) {
    const [businessLines, driverInfo, truckInfo] = await Promise.all([
      HaulingService.getAllBusinessLines({
        schemaName: this.schemaName,
      }),
      HaulingService.getDriverInfo({
        schemaName: this.schemaName,
        id: Number(driverId),
      }),
      HaulingService.getTruckInfo({
        schemaName: this.schemaName,
        id: Number(truckId),
      }),
    ]);

    return { businessLines, driverInfo, truckInfo };
  }

  static _applySearchToQuery(query, searchInput) {
    const { searchId, searchQuery } = parseSearchInput(searchInput) ?? {};

    if (!searchQuery) {
      return query;
    }

    const TRGM_MIN_SYMBOLS = 3;
    const DASHBOARD_TRGM_SEARCH_WHERE_CLAUSES = {
      dailyRoute: '? % daily_routes.name',
      truckType: '? % daily_routes.truck_type',
      driverName: '? % daily_routes.driver_name',
    };

    const DASHBOARD_TRGM_SEARCH_ORDER_BY_CLAUSES = {
      dailyRoute: '? <-> daily_routes.name',
      truckType: '? <-> daily_routes.truck_type',
      driverName: '? <-> daily_routes.driver_name',
    };

    query = query
      .orderByRaw(DASHBOARD_TRGM_SEARCH_ORDER_BY_CLAUSES.dailyRoute, [searchQuery])
      .orderByRaw(DASHBOARD_TRGM_SEARCH_ORDER_BY_CLAUSES.truckType, [searchQuery])
      .orderByRaw(DASHBOARD_TRGM_SEARCH_ORDER_BY_CLAUSES.driverName, [searchQuery]);

    query = query.where(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.truckId`, searchId);
      }

      if (searchQuery.length >= TRGM_MIN_SYMBOLS) {
        builder
          .orWhereRaw(DASHBOARD_TRGM_SEARCH_WHERE_CLAUSES.dailyRoute, [searchQuery])
          .orWhereRaw(DASHBOARD_TRGM_SEARCH_WHERE_CLAUSES.truckType, [searchQuery])
          .orWhereRaw(DASHBOARD_TRGM_SEARCH_WHERE_CLAUSES.driverName, [searchQuery]);
      }

      return builder;
    });

    return query;
  }

  static _buildDailyRoutesQueryBasedOnServiceAreaIds(query, serviceAreaIds) {
    query = query
      .distinct(`${this.tableName}.*`)
      .leftJoinRelated({ workOrders: true })
      .whereIn('workOrders.serviceAreaId', serviceAreaIds);

    return query;
  }
}
