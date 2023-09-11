import partition from 'lodash/partition.js';
import snakeCase from 'lodash/snakeCase.js';
import uniq from 'lodash/uniq.js';

import { parseISO } from 'date-fns';
import {
  WORK_ORDER_ERRORS,
  CANCELLATION_REASONS,
  SORTING_COLUMN,
  WO_STATUSES,
  WO_STATUS,
} from '../consts/workOrder.js';
import { DEFAULT_LIMIT, DEFAULT_SKIP } from '../consts/defaults.js';
import { TABLES } from '../consts/tables.js';
import { SORT_ORDER_ENUM } from '../consts/sortOrders.js';
import { ORDER_STATUS } from '../consts/order.js';
import { EVENT_TYPE } from '../consts/comment.js';
import { HaulingService } from '../services/hauling.js';
import { parseSearchInput } from '../utils/search.js';
import WorkOrderMapper from '../mappers/WorkOrderMapper.js';

import { syncWosToHauling } from '../services/amqp/syncWosToHauling/index.js';
import BaseModel from './_base.js';

export default class WorkOrder extends BaseModel {
  static get tableName() {
    return TABLES.WORK_ORDERS;
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        workOrderId: { type: 'integer' },
        orderId: { type: 'integer' },
        status: { enum: WO_STATUSES },
        businessLineId: { type: 'integer' },
        businessUnitId: { type: 'integer' },
        customerId: { type: 'integer' },
        equipmentItemId: { type: 'integer' },
        jobSiteId: { type: 'integer' },
        billableServiceId: { type: 'integer' },
        billableServiceDescription: { type: 'string' },
        signatureRequired: { type: 'boolean' },
        toRoll: { type: 'boolean' },
        alleyPlacement: { type: 'boolean' },
        poRequired: { type: 'boolean' },
        permitRequired: { type: 'boolean' },
        serviceAreaId: { type: 'integer' },
        displayId: { type: 'string' },
        orderDisplayId: { type: 'string' },
        jobSiteContactId: { type: ['integer', null] },
        phoneNumber: { type: ['string', null] },
        materialId: { type: ['integer', null] },
        subscriptionId: { type: ['integer', null] },
        serviceItemId: { type: ['integer', null] },
        preferredRoute: { type: ['string', null] },
        bestTimeToComeTo: { type: ['string', null] },
        bestTimeToComeFrom: { type: ['string', null] },
        assignedRoute: { type: ['string', null] },
        sequence: { type: ['integer', null] },
        dailyRouteId: { type: ['integer', null] },
        instructionsForDriver: { type: ['string', null] },
        cancellationReason: { enum: [...CANCELLATION_REASONS, null] },
        cancellationComment: { type: ['string', null] },
        pickedUpEquipment: { type: ['string', null] },
        droppedEquipment: { type: ['string', null] },
        weight: { type: ['number', null] },
        weightUnit: { type: ['string', null] },
        jobSiteNote: { type: ['string', null] },
        someoneOnSite: { type: ['boolean', null] },
        highPriority: { type: ['boolean', null] },
        thirdPartyHaulerId: { type: ['integer', null] },
        equipmentItemSize: { type: ['number', null] },
      },
    };
  }

  static get relationMappings() {
    const { JobSite, DailyRoute, Comment, WorkOrderMedia } = this.models;

    return {
      jobSite: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: JobSite,
        join: {
          from: `${this.tableName}.jobSiteId`,
          to: `${JobSite.tableName}.id`,
        },
      },
      dailyRoute: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: DailyRoute,
        join: {
          from: `${this.tableName}.dailyRouteId`,
          to: `${DailyRoute.tableName}.id`,
        },
      },
      comments: {
        relation: BaseModel.HasManyRelation,
        modelClass: Comment,
        join: {
          from: `${this.tableName}.id`,
          to: `${Comment.tableName}.workOrderId`,
        },
      },
      workOrderMedia: {
        relation: BaseModel.HasManyRelation,
        modelClass: WorkOrderMedia,
        join: {
          from: `${this.tableName}.id`,
          to: `${WorkOrderMedia.tableName}.workOrderId`,
        },
      },
    };
  }

  static async afterInsert(args) {
    const { WorkOrderHistory } = this.models;
    const { transaction, result } = args;

    await Promise.all(
      result.map(wo =>
        WorkOrderHistory.recordWorkOrderData({ workOrderId: wo.id, data: wo }, transaction),
      ),
    );
  }

  static async afterUpdate(args) {
    const { WorkOrderHistory } = this.models;
    const { transaction, asFindQuery } = args;

    const res = await asFindQuery().select('*');

    await Promise.all(
      res.map(wo =>
        WorkOrderHistory.recordWorkOrderData({ workOrderId: wo.id, data: wo }, transaction),
      ),
    );
  }

  // This should only be called on sync from hauling
  static async upsertMany({ data }, trx) {
    const woData = data.map(wo => ({ ...wo, updatedAt: new Date().toUTCString() }));

    const result = await this.query(trx)
      .insert(woData)
      .onConflict(['work_order_id', 'is_independent'])
      .merge();

    return result;
  }

  static async getAllBy(condition) {
    const {
      businessUnitId,
      businessLineId,
      serviceAreaIds,
      materialIds,
      equipmentItemIds,
      serviceDate,
    } = condition;

    const result = await this.query()
      .skipUndefined()
      .withGraphFetched({ jobSite: true })
      .whereNull('thirdPartyHaulerId')
      .where({ businessUnitId, businessLineId, serviceDate })
      .whereIn('materialId', materialIds)
      .whereIn('equipmentItemId', equipmentItemIds)
      .whereIn('serviceAreaId', serviceAreaIds)
      .whereNot('status', WO_STATUS.deleted);

    return result;
  }

  static async getAllPaginated(businessUnitId, params) {
    const {
      skip = DEFAULT_SKIP,
      limit = DEFAULT_LIMIT,
      businessLineIds,
      serviceDate,
      status,
      serviceAreaIds,
      thirdPartyHaulerIds,
      assignedRoute,
      searchInput,
      sortBy = SORTING_COLUMN.completedAt,
      sortOrder = SORT_ORDER_ENUM.DESC,
    } = params;

    let query = this.query()
      .skipUndefined()
      .offset(skip)
      .limit(limit)
      .select([
        `${this.tableName}.*`,
        `${TABLES.JOB_SITES}.fullAddress`,
        `${TABLES.COMMENTS}.id as commentId`,
        `${TABLES.WORK_ORDERS_MEDIA}.id as mediaId`,
      ])
      // Used joins here because withGraphFetched/withGraphJoined works incorrectly with LIMIT
      .leftJoin(TABLES.JOB_SITES, `${this.tableName}.jobSiteId`, `${TABLES.JOB_SITES}.id`)
      .leftJoin(TABLES.COMMENTS, `${this.tableName}.id`, `${TABLES.COMMENTS}.workOrderId`)
      .leftJoin(
        TABLES.WORK_ORDERS_MEDIA,
        `${this.tableName}.id`,
        `${TABLES.WORK_ORDERS_MEDIA}.workOrderId`,
      )
      .where({ businessUnitId, serviceDate, assignedRoute })
      .whereIn('businessLineId', businessLineIds)
      .whereIn('status', status)
      .whereIn('serviceAreaId', serviceAreaIds)
      .whereNot('status', WO_STATUS.deleted);

    query = this._buildWorkOrdersQueryBasedOnThirdPartyHaulerIds(query, thirdPartyHaulerIds);
    query = this._buildWorkOrdersQueryBasedOnSortBy(query, sortBy, sortOrder);
    query = this._applySearchToQuery(query, searchInput);

    const result = await query;

    return result;
  }

  static async update(input, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { DailyRoute, WorkOrderHistory } = this.models;
    const { id, assignedRoute, status, ...restInput } = input;

    try {
      const {
        orderId,
        isIndependent,
        completedAt,
        assignedRoute: route,
      } = await this.getById(id, ['orderId', 'isIndependent', 'completedAt', 'assignedRoute'], trx);

      const parentOrder = await HaulingService.getParentOrder(isIndependent, {
        schemaName: this.schemaName,
        id: orderId,
      });

      if (parentOrder.status === ORDER_STATUS.invoiced) {
        if (!outerTransaction) {
          await trx.commit();
        }

        return {
          message: WORK_ORDER_ERRORS.editNotAllowed,
          parentOrderId: orderId,
        };
      }

      if (!completedAt && status === WO_STATUS.completed) {
        restInput.completedAt = new Date().toUTCString();
      }
      if (status === WO_STATUS.scheduled || status === WO_STATUS.inProgress) {
        restInput.completedAt = null;
      }

      if (assignedRoute && route !== assignedRoute) {
        const dailyRoute = await DailyRoute.getBy(
          {
            condition: { name: assignedRoute },
            fields: ['id', 'name', 'truckId', 'driverId', 'driverName', 'truckType', 'truckName'],
          },
          trx,
        );
        const nextSequence = await this._getNextSequence({ id, assignedRoute }, trx);

        await this.patchById(
          // TODO: probably need to update preferredRoute as well
          id,
          {
            dailyRouteId: dailyRoute.id,
            assignedRoute: dailyRoute.name,
            sequence: nextSequence,
            status,
            ...restInput,
          },
          trx,
        );

        await DailyRoute.patchById(dailyRoute.id, { isEdited: true }, trx);
        await WorkOrderHistory.recordDailyRouteData({ workOrderId: id, data: dailyRoute }, trx);
      } else {
        const routeData =
          assignedRoute === null
            ? {
                dailyRouteId: null,
                assignedRoute: null,
                sequence: null,
              }
            : {};

        await this.patchById(id, { status, ...restInput, ...routeData }, trx);
      }

      const data = await this.getById(id, ['*'], trx);
      const media = await data.$relatedQuery('workOrderMedia');

      await syncWosToHauling(this.appContext, data);

      if (!outerTransaction) {
        await trx.commit();
      }

      data.media = media;
      data.serviceDate = new Date(data.serviceDate.toUTCString());
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
    const { DailyRoute, Comment } = this.models;

    const { id, status, comment, longitude, latitude } = input;

    try {
      // eslint-disable-next-line prefer-const
      let { completedAt, dailyRouteId } = await this.getById(
        id,
        ['completedAt', 'dailyRouteId'],
        trx,
      );

      if (!completedAt && status === WO_STATUS.completed) {
        completedAt = new Date().toUTCString();
      }

      let result;

      if (status) {
        result = await this.patchAndFetchById(
          id,
          { status, statusLonChange: longitude, statusLatChange: latitude, completedAt },
          trx,
        );
      } else {
        result = await this.getById(id, '*', trx);
      }

      if (comment) {
        await Comment.create(
          { workOrderId: id, eventType: EVENT_TYPE.comment, role: 'Driver', comment },
          trx,
        );
      }

      await DailyRoute.patchById(dailyRouteId, { isEdited: true }, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return result;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async softDelete(workOrder) {
    const { id, workOrderId, isIndependent, ...dataToUpdate } = workOrder;

    const result = await this.query()
      .skipUndefined()
      .withSchema(this.schemaName)
      .update(dataToUpdate)
      .where({ id, workOrderId, isIndependent });

    return result;
  }

  static async getByServiceItems(serviceItemsIds, condition) {
    const { serviceDate } = condition;

    const result = await this.query()
      .withSchema(this.schemaName)
      .where(`${this.tableName}.serviceDate`, serviceDate)
      .whereNot(`${this.tableName}.status`, WO_STATUS.deleted)
      .whereIn(`${this.tableName}.serviceItemId`, serviceItemsIds);

    return result;
  }

  static async bulkStatusChange(condition, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    const { ids } = condition;

    try {
      const workOrders = await this.getByIds(
        ids,
        ['id', 'completedAt', 'orderId', 'isIndependent'],
        trx,
      );

      const parentOrders = await this._getParentOrders(workOrders);

      const [invoiced, notInvoiced] = partition(
        parentOrders,
        order => order.status === ORDER_STATUS.invoiced,
      );

      if (invoiced?.length) {
        if (!outerTransaction) {
          await trx.commit();
        }

        return {
          invalid: invoiced.map(({ workOrderId }) => workOrderId),
          valid: notInvoiced?.map(({ workOrderId }) => workOrderId),
        };
      }

      const workOrdersDataToPatch = WorkOrderMapper.mapToBulkStatusChange({
        workOrders,
        ...condition,
      });

      const data = await this.patchAndFetchMany(workOrdersDataToPatch, trx);
      await syncWosToHauling(this.appContext, data);

      if (!outerTransaction) {
        await trx.commit();
      }

      return null;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async bulkReschedule(condition, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    const { ids, serviceDate } = condition;

    try {
      const workOrders = await this.getByIds(ids, ['id', 'orderId', 'isIndependent'], trx);

      const parentOrders = await this._getParentOrders(workOrders);
      const [invoiced, notInvoiced] = partition(
        parentOrders,
        order => order.status === ORDER_STATUS.invoiced,
      );

      if (invoiced?.length) {
        if (!outerTransaction) {
          await trx.commit();
        }

        return {
          valid: notInvoiced?.map(({ workOrderId }) => workOrderId),
          invalid: invoiced?.map(({ workOrderId }) => workOrderId),
        };
      }

      const workOrdersDataToPatch = ids.map(id => ({
        id,
        serviceDate,
        assignedRoute: null,
        dailyRouteId: null,
        sequence: null,
        status: WO_STATUS.scheduled,
      }));

      const data = await this.patchAndFetchMany(workOrdersDataToPatch, trx);
      data.serviceDate = parseISO(data.serviceDate);
      await syncWosToHauling(this.appContext, data);

      if (!outerTransaction) {
        await trx.commit();
      }

      return null;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async checkItemsRouteStatus(ids) {
    const query = this.query()
      .skipUndefined()
      .withGraphFetched({ dailyRoute: true })
      .whereIn(`${this.tableName}.id`, ids);

    const workOrders = await query;

    const result = {
      available: [],
      updating: [],
    };

    workOrders.forEach(item => {
      const hasUpdatingParent = item.dailyRoute?.editingBy;

      if (!hasUpdatingParent) {
        return result.available.push(item.id);
      }

      return result.updating.push(item.id);
    });

    return result;
  }

  static async detachFromRoutesByIds(ids, outerTransaction) {
    const trx = outerTransaction ?? this.knex();

    const result = await this.query(trx)
      .update({ dailyRouteId: null, sequence: null, assignedRoute: null })
      .whereIn('dailyRouteId', ids);

    return result;
  }

  static async getByWorkOrderIds(ids, fields = ['*'], trx) {
    const result = await this.query(trx).select(fields).whereIn('workOrderId', ids);
    return result;
  }

  static async upsertWosAndSyncToHauling(workOrders, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { DailyRoute } = this.models;

    try {
      const incomingWosIds = workOrders.map(wo => wo.workOrderId);
      const incomingWosWithPreferredRoute = workOrders.filter(wo => wo.preferredRoute);

      const existingWorkOrders = await this.getByWorkOrderIds(
        incomingWosIds,
        ['workOrderId', 'assignedRoute'],
        trx,
      );

      if (!incomingWosWithPreferredRoute.length && !existingWorkOrders.length) {
        // If incoming WOs doesn't have preferredRoute and such WOs doesn't exist in route-planner DB,
        // it means that is new WOs, that don't have attached dailyRoute and they should be inserted into route planner DB as is
        await this.upsertMany({ data: workOrders }, trx);

        if (!outerTransaction) {
          await trx.commit();
        }
        return null;
      }

      const { existingWosMap, dailyRoutesMap, wosMaxSequencesMap } = await this._createEntityMaps(
        {
          incomingWosWithPreferredRoute,
          existingWorkOrders,
        },
        trx,
      );

      const { wosToUpsert, wosForSyncToHauling, dailyRouteNamesToPatch } =
        this._getDataForUpsertAndForSyncToHauling({
          workOrders,
          existingWosMap,
          dailyRoutesMap,
          wosMaxSequencesMap,
        });

      await Promise.all([
        this.upsertMany({ data: [...wosToUpsert, ...wosForSyncToHauling] }, trx),
        DailyRoute.patchByNames(dailyRouteNamesToPatch, { isEdited: true }, trx),
      ]);

      await syncWosToHauling(this.appContext, wosForSyncToHauling);

      if (!outerTransaction) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }

    return 'sucess';
  }

  /* PRIVATE METHODS */

  static _getDataForUpsertAndForSyncToHauling(options) {
    const { workOrders, existingWosMap, dailyRoutesMap, wosMaxSequencesMap } = options;

    const { wosToUpsert, wosForSyncToHauling, dailyRouteNamesToPatch } = workOrders.reduce(
      (acc, incomingWo, idx) => {
        const existingWo = existingWosMap.get(incomingWo.workOrderId);
        const incomingWoDailyRoute = dailyRoutesMap.get(incomingWo.preferredRoute);
        const existingWoDailyRoute = dailyRoutesMap.get(existingWo?.assignedRoute);
        const maxSequence = wosMaxSequencesMap.get(incomingWo.preferredRoute);

        if (incomingWo.preferredRoute === existingWo?.assignedRoute) {
          acc.wosToUpsert.push(incomingWo);
          return acc;
        }

        acc.dailyRouteNamesToPatch.push(incomingWoDailyRoute?.name, existingWoDailyRoute?.name);

        if (incomingWo.preferredRoute === null) {
          incomingWo.assignedRoute = null;
          incomingWo.dailyRouteId = null;
          incomingWo.sequence = null;

          acc.wosForSyncToHauling.push(incomingWo);
          return acc;
        }

        incomingWo.assignedRoute = incomingWoDailyRoute.name;
        incomingWo.dailyRouteId = incomingWoDailyRoute.id;
        incomingWo.sequence = maxSequence + 1 + idx;

        acc.wosForSyncToHauling.push(incomingWo);
        return acc;
      },
      {
        wosToUpsert: [],
        wosForSyncToHauling: [],
        dailyRouteNamesToPatch: [],
      },
    );

    return {
      wosToUpsert,
      wosForSyncToHauling,
      dailyRouteNamesToPatch: uniq(dailyRouteNamesToPatch).filter(Boolean),
    };
  }

  static async _createEntityMaps(options, trx) {
    const { DailyRoute } = this.models;
    const { incomingWosWithPreferredRoute, existingWorkOrders } = options;

    const dailyRouteNames = uniq([
      ...incomingWosWithPreferredRoute.map(wo => wo.preferredRoute),
      ...existingWorkOrders.map(wo => wo.assignedRoute).filter(Boolean),
    ]);

    const wosMaxSequences = await Promise.all(
      dailyRouteNames.map(async drName => {
        const { max } = await this.query(trx)
          .max('sequence')
          .where({ assignedRoute: drName })
          .first();

        return { preferredRoute: drName, max };
      }),
    );

    const dailyRoutes = await DailyRoute.getByNames(dailyRouteNames, ['id', 'name'], trx);

    const dailyRoutesMap = dailyRoutes.reduce((acc, curr) => acc.set(curr.name, curr), new Map());

    const wosMaxSequencesMap = wosMaxSequences.reduce(
      (acc, curr) => acc.set(curr.preferredRoute, curr.max),
      new Map(),
    );

    const existingWosMap = existingWorkOrders.reduce(
      (acc, curr) => acc.set(curr.workOrderId, curr),
      new Map(),
    );

    return {
      dailyRoutesMap,
      wosMaxSequencesMap,
      existingWosMap,
    };
  }

  static async _getParentOrders(wos) {
    const { schemaName } = this;

    return Promise.all(
      wos.map(async ({ id: workOrderId, orderId: id, isIndependent }) => {
        const order = await HaulingService.getParentOrder(isIndependent, {
          schemaName,
          id,
        });

        return {
          workOrderId,
          ...order,
        };
      }),
    );
  }

  static async _getNextSequence(options, trx) {
    const { id, assignedRoute } = options;
    const { max } = await this.query(trx).max('sequence').where({ assignedRoute }).first();
    const isWoAlreadyAttached = await this.getBy(
      // This check needs to NOT increment sequence if the user a few times will send update request with the same assignedRoute
      {
        condition: { id, assignedRoute },
        fields: ['id'],
      },
      trx,
    );

    const nextSequence = isWoAlreadyAttached ? max : max + 1;

    return nextSequence;
  }

  static _applySearchToQuery(query, searchInput) {
    const { searchId, searchQuery } = parseSearchInput(searchInput) ?? {};

    if (!searchQuery) {
      return query;
    }

    const TRGM_MIN_SYMBOLS = 3;
    const WORK_ORDER_TRGM_SEARCH_WHERE_CLAUSES = {
      assignedRoute: '? % assigned_route',
      zip: '? % job_site.zip',
      city: '? % job_site.city',
      addressLine: '? % job_site.address_line_1',
    };

    const WORK_ORDER_TRGM_SEARCH_ORDER_BY_CLAUSES = {
      assignedRoute: '? <-> work_orders.assigned_route',
      zip: '? <-> job_site.zip',
      city: '? <-> job_site.city',
      addressLine: '? <-> job_site.address_line_1',
    };

    query = query
      .leftJoinRelated({ jobSite: true })
      .orderByRaw(WORK_ORDER_TRGM_SEARCH_ORDER_BY_CLAUSES.assignedRoute, [searchQuery])
      .orderByRaw(WORK_ORDER_TRGM_SEARCH_ORDER_BY_CLAUSES.zip, [searchQuery])
      .orderByRaw(WORK_ORDER_TRGM_SEARCH_ORDER_BY_CLAUSES.city, [searchQuery])
      .orderByRaw(WORK_ORDER_TRGM_SEARCH_ORDER_BY_CLAUSES.addressLine, [searchQuery]);

    query = query.where(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.displayId`, searchId);
      }

      if (searchQuery.length >= TRGM_MIN_SYMBOLS) {
        builder
          .orWhereRaw(WORK_ORDER_TRGM_SEARCH_WHERE_CLAUSES.assignedRoute, [searchQuery])
          .orWhereRaw(WORK_ORDER_TRGM_SEARCH_WHERE_CLAUSES.zip, [searchQuery])
          .orWhereRaw(WORK_ORDER_TRGM_SEARCH_WHERE_CLAUSES.city, [searchQuery])
          .orWhereRaw(WORK_ORDER_TRGM_SEARCH_WHERE_CLAUSES.addressLine, [searchQuery]);
      }

      return builder;
    });

    return query;
  }

  static _buildWorkOrdersQueryBasedOnThirdPartyHaulerIds(query, thirdPartyHaulerIds) {
    if (!thirdPartyHaulerIds) {
      return query;
    }

    const shouldGetNullableThirdPartyHauler = thirdPartyHaulerIds.includes(null);
    const notNullThirdPartyHaulerIds = thirdPartyHaulerIds.filter(id => id !== null);

    if (shouldGetNullableThirdPartyHauler) {
      return query.andWhere(builder => {
        const queryBuilder = builder.whereNull(`${this.tableName}.thirdPartyHaulerId`);

        if (notNullThirdPartyHaulerIds.length) {
          queryBuilder.orWhereIn(
            `${this.tableName}.thirdPartyHaulerId`,
            notNullThirdPartyHaulerIds,
          );
        }

        return queryBuilder;
      });
    }

    return query.whereIn(`${this.tableName}.thirdPartyHaulerId`, thirdPartyHaulerIds);
  }

  static _buildWorkOrdersQueryBasedOnSortBy(query, sortBy, sortOrder) {
    const POSSIBLE_NULL_FIRST_COLUMNS = ['instructionsForDriver', 'commentId', 'mediaId'];

    if (POSSIBLE_NULL_FIRST_COLUMNS.includes(sortBy)) {
      return query.orderByRaw(`${snakeCase(sortBy)} ${sortOrder}`);
    }

    return query.orderByRaw(`${snakeCase(sortBy)} ${sortOrder} NULLS LAST`);
  }
}
