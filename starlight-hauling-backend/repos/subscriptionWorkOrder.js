/* eslint-disable camelcase */
import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import ApiError from '../errors/ApiError.js';
import { camelCaseKeys, unambiguousCondition, unambiguousSelect } from '../utils/dbHelpers.js';
import { mathRound2 } from '../utils/math.js';
import { mapSubOrderStatus } from '../services/subscriptionWorkOrders/utils/mapSubOrderStatus.js';
// pre-pricing service refactor code:
// import config from '../db/config.js';
// import { SORT_ORDER } from '../consts/sortOrders.js';
// import { SUBSCRIPTION_WO_STATUS, SUBSCRIPTION_WO_STATUSES } from '../consts/workOrder.js';
// import { EVENT_TYPE } from '../consts/historicalEventType.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import { SUBSCRIPTION_WO_STATUS, SUBSCRIPTION_WO_STATUSES } from '../consts/workOrder.js';
import { EVENT_TYPE } from '../consts/historicalEventType.js';
import {
  pricingGetSubscriptionByStatus,
  pricingSoftDeleteSubscriptionWorkOrder,
  pricingSubscriptionWorkOrderCount,
  pricingSubscriptionWorkOrderCountJoin,
  pricingSubscriptionWorkOrderCountStatus,
  pricingUpdateStatusBySubscriptionsOrdersIds,
} from '../services/pricing.js';
import VersionedRepository from './_versioned.js';
import SubscriptionWorkOrderMediaRepo from './subscriptionWorkOrderMedia.js';
import SubscriptionWorkOrderLineItemRepo from './subscriptionWorkOrderLineItem.js';
import SubscriptionOrderRepo from './subscriptionOrder/subscriptionOrder.js';
import SubscriptionsServiceItemsRepo from './subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionLineItem from './subscriptionLineItem.js';
import BillableServiceRepo from './billableService.js';
import BillableLineItemRepo from './billableLineItem.js';
import MaterialRepo from './material.js';
import PurchaseOrderRepo from './purchaseOrder.js';

const TABLE_NAME = 'subscription_work_orders';

class SubscriptionWorkOrdersRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['sequenceId'];
  }

  getCtx() {
    return {
      state: this.ctxState,
      logger: this.ctxState.logger,
    };
  }

  // ToDo: Modify this endpoint to take information from the pricing backend
  // By: Esteban Navarro || Ticket: PS-230
  async getAllPaginated(
    {
      condition: { subscriptionOrderId },
      skip,
      limit,
      sortBy = 'id',
      sortOrder = SORT_ORDER.asc,
      isCompletion = false,
    } = {},
    trx = this.knex,
  ) {
    const selects = [
      `${this.tableName}.*`,
      trx.raw('to_json(??.*) as ??', [PurchaseOrderRepo.TABLE_NAME, 'purchaseOrder']),
    ];

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .leftJoin(
        PurchaseOrderRepo.TABLE_NAME,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
        `${this.tableName}.purchaseOrderId`,
      )
      .where(`${this.tableName}.subscriptionOrderId`, subscriptionOrderId)
      .whereNull('deletedAt')
      .orderBy(sortBy, sortOrder);

    if (limit) {
      query = query.limit(limit);
    }
    if (skip) {
      query = query.offset(skip);
    }

    const items = await query;
    let mediaMap = {};
    let lineItemsMap = {};
    if (!isEmpty(items)) {
      const subscriptionWorkOrdersMediaRepo = SubscriptionWorkOrderMediaRepo.getInstance(
        this.ctxState,
      );
      const subscriptionWorkOrderLineItemRepo = SubscriptionWorkOrderLineItemRepo.getInstance(
        this.ctxState,
      );
      const subscriptionWorkOrdersIds = items.map(item => item.id);
      const promises = [];

      if (!isCompletion) {
        promises.push(
          subscriptionWorkOrderLineItemRepo.getAllGroupedByWorkOrder(
            subscriptionWorkOrdersIds,
            trx,
          ),

          subscriptionWorkOrdersMediaRepo.getAllGroupedByWorkOrder(subscriptionWorkOrdersIds, trx),
        );
      }

      const [media, lineItems] = await Promise.all(promises);
      if (!isEmpty(media)) {
        mediaMap = media.reduce((res, item) => {
          if (!isEmpty(item)) {
            res[item.subscriptionWorkOrderId] = item.media;
          }
          return res;
        }, {});
      }
      if (!isEmpty(lineItems)) {
        lineItemsMap = lineItems.reduce((res, item) => {
          if (!isEmpty(item)) {
            res[item.subscriptionWorkOrderId] = item.lineItems;
          }
          return res;
        }, {});
      } else {
        items.forEach(item => {
          Object.assign(item, { lineItems: [] });
        });
      }
    }

    return isEmpty(items)
      ? []
      : items.map(item => this.mapFields(item, { mediaMap, lineItemsMap }));
  }

  async getById({ id, fields = ['*'] } = {}, trx = this.knex) {
    const subscriptionsServiceItemsTable = SubscriptionsServiceItemsRepo.TABLE_NAME;
    const subscriptionOrderTable = SubscriptionOrderRepo.TABLE_NAME;
    const subscriptionLineItem = SubscriptionLineItem.TABLE_NAME;
    const BillableServiceHT = BillableServiceRepo.getHistoricalTableName();
    const BillableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    const MaterialHT = MaterialRepo.getHistoricalTableName();
    const selects = [
      ...unambiguousSelect(this.tableName, fields),
      trx.raw('to_json(??.*) as ??', [subscriptionsServiceItemsTable, 'subscriptionServiceItem']),
      trx.raw('to_json(??.*) as ??', [PurchaseOrderRepo.TABLE_NAME, 'purchaseOrder']),
      trx.raw('json_agg(??.*) as ??', [subscriptionLineItem, 'recurrentLineItems']),
      trx.raw('to_json(??.*) as ??', [BillableServiceHT, 'billableService']),
      trx.raw('json_agg(??.*) as ??', [BillableLineItemHT, 'billableLineItems']),
      trx.raw('??.?? as ??', [MaterialHT, 'originalId', 'MaterialId']),
    ];

    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(
        subscriptionOrderTable,
        `${subscriptionOrderTable}.id`,
        `${this.tableName}.subscriptionOrderId`,
      )
      .leftJoin(
        PurchaseOrderRepo.TABLE_NAME,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
        `${this.tableName}.purchaseOrderId`,
      )
      .innerJoin(
        subscriptionsServiceItemsTable,
        `${subscriptionsServiceItemsTable}.id`,
        `${subscriptionOrderTable}.subscriptionServiceItemId`,
      )
      .leftJoin(MaterialHT, `${MaterialHT}.id`, `${subscriptionOrderTable}.materialId`)
      .leftJoin(
        subscriptionLineItem,
        `${subscriptionLineItem}.subscriptionServiceItemId`,
        `${subscriptionsServiceItemsTable}.id`,
      )
      .leftJoin(
        BillableServiceHT,
        `${BillableServiceHT}.id`,
        `${subscriptionsServiceItemsTable}.billableServiceId`,
      )
      .leftJoin(
        BillableLineItemHT,
        `${BillableLineItemHT}.id`,
        `${subscriptionLineItem}.billableLineItemId`,
      )
      .where(`${this.tableName}.id`, id)
      .whereNull(`${subscriptionOrderTable}.deletedAt`)
      .whereNull(`${this.tableName}.deletedAt`)
      .groupBy([
        `${this.tableName}.id`,
        `${subscriptionsServiceItemsTable}.id`,
        `${BillableServiceHT}.id`,
        `${MaterialHT}.id`,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
      ])

      .first();

    const workOrder = await query;

    let mediaMap = {};
    let lineItemsMap = {};
    if (workOrder) {
      const subscriptionWorkOrdersMediaRepo = SubscriptionWorkOrderMediaRepo.getInstance(
        this.ctxState,
      );
      const subscriptionWorkOrderLineItemRepo = SubscriptionWorkOrderLineItemRepo.getInstance(
        this.ctxState,
      );
      const [media, lineItems] = await Promise.all([
        subscriptionWorkOrdersMediaRepo.getAllGroupedByWorkOrder([workOrder.id], trx),
        subscriptionWorkOrderLineItemRepo.getAllGroupedByWorkOrder([workOrder.id], trx),
      ]);
      if (!isEmpty(media)) {
        mediaMap = media.reduce((res, item) => {
          if (!isEmpty(item)) {
            res[item.subscriptionWorkOrderId] = item.media;
          }
          return res;
        }, {});
      }
      if (!isEmpty(lineItems)) {
        lineItemsMap = lineItems.reduce((res, item) => {
          if (!isEmpty(item)) {
            res[item.subscriptionWorkOrderId] = item.lineItems;
          }
          return res;
        }, {});
      }

      if (!workOrder.lineItems) {
        workOrder.lineItems = [];
      }
    }

    return workOrder ? this.mapFields(workOrder, { mediaMap, lineItemsMap }) : null;
  }

  async getSequenceId(subscriptionOrderId, trx) {
    const _trx = trx || (await this.knex.transaction());
    const subscriptionOrderTable = SubscriptionOrderRepo.TABLE_NAME;

    const [workOrderSequenceId, { sequenceId: orderSequenceId }] = await Promise.all([
      super.count({ condition: { subscriptionOrderId } }, _trx),
      trx(subscriptionOrderTable)
        .withSchema(this.schemaName)
        .select(['sequenceId'])
        .where(`id`, subscriptionOrderId)
        .first(),
    ]);
    return [workOrderSequenceId, orderSequenceId];
  }

  async createOne({ data, fields = ['*'], log } = {}, trx, { noRecord = false } = {}) {
    let obj;
    const _trx = trx || (await this.knex.transaction());

    const [workOrderSequenceId, orderSequenceId] = await this.getSequenceId(
      data.subscriptionOrderId,
      _trx,
    );

    try {
      obj = await super.createOne(
        {
          data: {
            ...data,
            sequenceId: `${orderSequenceId}.${workOrderSequenceId + 1}`,
          },
          fields: '*',
          log: false,
        },
        _trx,
      );

      if (obj) {
        if (!noRecord) {
          await this.makeHistoricalRecord(
            {
              data: this.constructor.filterOutTechFields(obj),
              originalId: obj.id,
              eventType: EVENT_TYPE.created,
            },
            _trx,
          );
        }
      } else {
        this.ctxState.logger.error(
          `Error creating a historical record for table ${this.tableName} with ${data}`,
        );
        throw ApiError.unknown();
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && this.log({ id: obj.id, action: this.logAction.create });

    return VersionedRepository.getFields(obj, fields);
  }

  // insertMany from VersionedRepo use this.createOne instead super
  async insertMany({ subscriptionOrderId, data: dataArr, fields = [], log }, trx) {
    const _trx = trx || (await this.knex.transaction());

    const [workOrderSequenceId, orderSequenceId] = await this.getSequenceId(
      subscriptionOrderId,
      _trx,
    );

    let items;
    try {
      items = await Promise.all(
        dataArr.map(
          (data, i) =>
            super.createOne(
              {
                data: {
                  ...data,
                  sequenceId: `${orderSequenceId}.${workOrderSequenceId + i + 1}`,
                },
                fields,
              },
              _trx,
            ),
          this,
        ),
      );

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    if (log) {
      items.forEach(({ id }) => {
        this.log({ id, action: this.logAction.create });
      });
    }

    return items;
  }

  async updateByStatuses({ condition, statuses = [], data } = {}, trx) {
    const workOrders = await super
      .getAll({ condition, fieds: ['id'] }, trx)
      .whereIn('status', statuses);

    let updatedWos;

    if (!isEmpty(workOrders)) {
      updatedWos = await pricingUpdateStatusBySubscriptionsOrdersIds(this.getCtx(), {
        data: {
          ids: workOrders.map(({ id }) => id),
          data,
        },
      });
    }

    return updatedWos || [];
  }

  async updateOne({ condition: { id }, data, fields = ['*'], concurrentData, log } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());
    const subscriptionWorkOrderLineItemRepo = SubscriptionWorkOrderLineItemRepo.getInstance(
      this.ctxState,
    );

    let workOrder;
    try {
      const { lineItems, ...workOrderData } = data;

      const subscriptionWorkOrder = await super.getById(
        { id, fields: ['subscriptionOrderId', 'status'] },
        _trx,
      );

      let billableLineItemsTotal = 0;

      if (lineItems?.length) {
        lineItems.forEach(lineItem => {
          billableLineItemsTotal += mathRound2(
            Number(lineItem.price || 0) * Number(lineItem.quantity || 1),
          );
        });
      }

      workOrderData.billableLineItemsTotal = billableLineItemsTotal;

      workOrder = await super.updateBy(
        {
          condition: { id },
          data: workOrderData,
          fields,
          concurrentData,
          log,
        },
        _trx,
      );

      await subscriptionWorkOrderLineItemRepo.upsertMany(
        {
          data: lineItems,
          subscriptionWorkOrderId: id,
          subscriptionOrderId: subscriptionWorkOrder.subscriptionOrderId,
        },
        _trx,
      );

      if (!trx) {
        await _trx.commit();
      }

      return workOrder;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async getIdsBySubscriptionOrderId({ subscriptionOrderId, condition }, trx = this.knex) {
    const selects = [`${this.tableName}.id`];
    const whereCondition = unambiguousCondition(this.tableName, condition);

    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .where(`${this.tableName}.subscriptionOrderId`, subscriptionOrderId)
      .whereNull('deletedAt')
      .andWhere(whereCondition);

    const items = await query;
    return isEmpty(items) ? [] : items.map(item => item.id);
  }

  async getBySubscriptionOrderIds({ subscriptionOrderIds, condition }, trx = this.knex) {
    const selects = [`${this.tableName}.id`, `${this.tableName}.status`];
    const whereCondition = unambiguousCondition(this.tableName, condition);

    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .whereIn(`${this.tableName}.subscriptionOrderId`, subscriptionOrderIds)
      .whereNull('deletedAt')
      .andWhere(whereCondition);

    const items = await query;
    return isEmpty(items) ? [] : items;
  }

  updateBySubscriptionsOrdersIds(
    {
      condition: { subscriptionsOrdersIds, ...condition },
      data,
      fields = [],
      skipEmpty = false,
      log = true,
    } = {},
    trx,
  ) {
    return subscriptionsOrdersIds?.length
      ? Promise.all(
          subscriptionsOrdersIds.map(subscriptionOrderId =>
            this.updateBy(
              {
                condition: { subscriptionOrderId, ...condition },
                data,
                fields,
                log,
              },
              trx,
              { skipEmpty },
            ),
          ),
          this,
        )
      : [];
  }

  mapFields(originalObj, { mediaMap, lineItemsMap } = {}) {
    const subscriptionServiceItemRepo = SubscriptionsServiceItemsRepo.getInstance(this.ctxState);
    const bsRepo = BillableServiceRepo.getInstance(this.ctxState);
    const purchaseOrderRepo = PurchaseOrderRepo.getInstance(this.ctxState);
    return compose(
      obj => {
        if (!isEmpty(mediaMap)) {
          obj.media = mediaMap[obj.id];
        }
        if (!isEmpty(lineItemsMap)) {
          obj.lineItems = lineItemsMap[obj.id] || [];
        }

        if (!isEmpty(obj.purchaseOrder)) {
          obj.purchaseOrder = purchaseOrderRepo.mapFields(obj.purchaseOrder);
        }

        if (!isEmpty(obj.subscriptionServiceItem)) {
          obj.subscriptionServiceItem.recurrentLineItems = [];
          obj.subscriptionServiceItem = subscriptionServiceItemRepo.mapFields(
            obj.subscriptionServiceItem,
          );

          if (obj.materialId) {
            obj.subscriptionServiceItem.materialId = obj.materialId;
            delete obj.materialId;
          }

          if (!isEmpty(obj.billableService)) {
            obj.subscriptionServiceItem.billableService = bsRepo.mapFields(obj.billableService);
            delete obj.billableService;
          }

          if (!isEmpty(obj.recurrentLineItems) && obj.recurrentLineItems[0]) {
            obj.subscriptionServiceItem.recurrentLineItems =
              obj.recurrentLineItems.map(camelCaseKeys);
            const recurrentLineIndices = obj.subscriptionServiceItem.recurrentLineItems.reduce(
              (res, item, idx) => {
                res[item.billableLineItemId] = idx;
                return res;
              },
              {},
            );

            obj.billableLineItems.forEach(line => {
              obj.subscriptionServiceItem.recurrentLineItems[
                recurrentLineIndices[line.id]
              ].billableLineItem = camelCaseKeys(line);
            });
          }
          delete obj.billableLineItems;
          delete obj.recurrentLineItems;
        }

        obj.billableLineItemsTotal = Number(obj.billableLineItemsTotal);

        return obj;
      },
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  // pre-pricing service code diff(https://d.pr/i/1AOgqq):
  // async subscriptionOrdersWosSummary(
  //   { subscriptionOrders, cancellation = false, onlyTotals = false } = {},
  //   trx = this.knex,
  // ) {
  //   const subscriptionWoMediaT = SubscriptionWorkOrderMediaRepo.TABLE_NAME;
  //   const subscriptionWoLineItemT = SubscriptionWorkOrderLineItemRepo.TABLE_NAME;
  //   const baseQuery = trx(this.tableName)
  //     .withSchema(this.schemaName)
  //     .select(`${this.tableName}.subscriptionOrderId`)
  //     .whereIn(
  //       `${this.tableName}.subscriptionOrderId`,
  //       subscriptionOrders.map(item => item.id),
  //     )
  //     .whereNull('deletedAt')
  //     .groupBy(`${this.tableName}.subscriptionOrderId`);

  //   const fieldsSummary = await Promise.all(
  //     [
  //       baseQuery.clone().select(trx.raw(`count(*) as total`)),
  //       onlyTotals
  //         ? null
  //         : baseQuery
  //             .clone()
  //             .select(trx.raw(`count(*) as has_comments`))
  //             .whereNotNull('commentFromDriver')
  //             .andWhereNot('commentFromDriver', ''),
  //       onlyTotals
  //         ? null
  //         : baseQuery
  //             .clone()
  //             .leftJoin(
  //               subscriptionWoMediaT,
  //               `${subscriptionWoMediaT}.subscriptionWorkOrderId`,
  //               `${this.tableName}.id`,
  //             )
  //             .select(trx.raw(`count(distinct ${subscriptionWoMediaT}.id) as has_media`))
  //             .whereNotNull(`${subscriptionWoMediaT}.id`),
  //       onlyTotals
  //         ? null
  //         : baseQuery
  //             .clone()
  //             .leftJoin(
  //               subscriptionWoLineItemT,
  //               `${subscriptionWoLineItemT}.subscriptionWorkOrderId`,
  //               `${this.tableName}.id`,
  //             )
  //             .select(trx.raw(`count(distinct ${subscriptionWoLineItemT}.id) as has_line_items`))
  //             .whereNotNull(`${subscriptionWoLineItemT}.id`),
  //       onlyTotals
  //         ? null
  //         : baseQuery
  //             .clone()
  //             .select(trx.raw(`count(*) as has_assigned_routes`))
  //             .whereNotNull('assignedRoute')
  //             .andWhereNot('assignedRoute', ''),
  //       onlyTotals
  //         ? null
  //         : baseQuery
  //             .clone()
  //             .select(trx.raw(`${config.publicSchema}.first(started_at) as started_at`))
  //             .andWhere('status', 'not in', [SUBSCRIPTION_WO_STATUS.scheduled])
  //             .orderBy(`started_at`, 'asc')
  //             .limit(1),
  //       onlyTotals
  //         ? null
  //         : baseQuery
  //             .clone()
  //             .select(trx.raw(`${config.publicSchema}.first(canceled_at) as canceled_at`))
  //             .andWhere('status', '=', SUBSCRIPTION_WO_STATUS.canceled)
  //             .orderBy(`canceled_at`, 'desc')
  //             .limit(1),
  //       onlyTotals
  //         ? null
  //         : baseQuery
  //             .clone()
  //             .select(trx.raw(`${config.publicSchema}.first(completed_at) as completed_at`))
  //             .andWhere('status', 'in', [
  //               SUBSCRIPTION_WO_STATUS.canceled,
  //               SUBSCRIPTION_WO_STATUS.completed,
  //             ])
  //             .orderBy(`completed_at`, 'desc')
  //             .limit(1),
  //       ...SUBSCRIPTION_WO_STATUSES.map(status =>
  //         baseQuery
  //           .clone()
  //           .select(trx.raw(`count(*) as ${status}`))
  //           .andWhereRaw(`status = '${status}'`),
  //       ),
  //     ].filter(Boolean),
  //   );

  //   this.ctxState.logger.debug(
  //     fieldsSummary,
  //     'subsWosRepo->subscriptionOrdersWosSummary->fieldsSummary',
  //   );

  //   const subscriptionOrdersSummariesMap = {};
  //   fieldsSummary.filter(Boolean).forEach(fieldSummary => {
  //     fieldSummary.forEach(fieldSummaryForSubscriptionOrder => {
  //       const { subscriptionOrderId, ...rest } = fieldSummaryForSubscriptionOrder;
  //       if (!subscriptionOrdersSummariesMap[subscriptionOrderId]) {
  //         subscriptionOrdersSummariesMap[subscriptionOrderId] = {
  //           subscriptionOrderId,
  //         };
  //       }
  //       subscriptionOrdersSummariesMap[subscriptionOrderId] = {
  //         ...subscriptionOrdersSummariesMap[subscriptionOrderId],
  //         ...rest,
  // end pre-pricing service code
  async subscriptionOrdersWosSummary({
    subscriptionOrders,
    cancellation = false,
    onlyTotals = false,
  } = {}) {
    const resultFieldSummary = [];
    for (const item of subscriptionOrders) {
      const subscriptionOrdersIds = [item.id];
      const [
        total,
        has_comments,
        has_media,
        has_line_items,
        has_assigned_routes,
        started_at,
        canceled_at,
        completed_at,
        scheduled,
        inProgress,
        blocked,
        completed,
        needsApproval,
        approved,
        canceled,
        finalized,
        invoiced,
      ] = await Promise.all(
        [
          pricingSubscriptionWorkOrderCount(this.getCtx(), {
            data: { subscriptionIds: subscriptionOrdersIds },
          }),
          onlyTotals
            ? null
            : pricingSubscriptionWorkOrderCount(this.getCtx(), {
                data: { subscriptionIds: subscriptionOrdersIds, hasComment: true },
              }),
          onlyTotals
            ? null
            : pricingSubscriptionWorkOrderCountJoin(this.getCtx(), {
                data: { subscriptionIds: subscriptionOrdersIds, subscriptionMedia: true },
              }),
          onlyTotals
            ? null
            : pricingSubscriptionWorkOrderCountJoin(this.getCtx(), {
                data: { subscriptionIds: subscriptionOrdersIds, subscriptionLine: true },
              }),
          onlyTotals
            ? null
            : pricingSubscriptionWorkOrderCount(this.getCtx(), {
                data: { subscriptionIds: subscriptionOrdersIds, hasRoutes: true },
              }),
          onlyTotals
            ? null
            : pricingGetSubscriptionByStatus(this.getCtx(), {
                data: {
                  subscriptionIds: subscriptionOrdersIds,
                  columnName: 'started_at',
                  orderBy: 'ASC',
                  condition: 'not in',
                  statuses: [SUBSCRIPTION_WO_STATUS.scheduled],
                },
              }),
          onlyTotals
            ? null
            : pricingGetSubscriptionByStatus(this.getCtx(), {
                data: {
                  subscriptionIds: subscriptionOrdersIds,
                  columnName: 'canceled_at',
                  orderBy: 'DESC',
                  condition: '=',
                  statuses: SUBSCRIPTION_WO_STATUS.canceled,
                },
              }),
          onlyTotals
            ? null
            : pricingGetSubscriptionByStatus(this.getCtx(), {
                data: {
                  subscriptionIds: subscriptionOrdersIds,
                  columnName: 'completed_at',
                  orderBy: 'DESC',
                  condition: 'in',
                  statuses: [SUBSCRIPTION_WO_STATUS.canceled, SUBSCRIPTION_WO_STATUS.completed],
                },
              }),
          ...SUBSCRIPTION_WO_STATUSES.map(status =>
            pricingSubscriptionWorkOrderCountStatus(this.getCtx(), {
              data: { subscriptionIds: subscriptionOrdersIds, status },
            }),
          ),
        ].filter(Boolean),
      );
      resultFieldSummary.push({
        ...item,
        fieldsSummary: {
          total,
          has_comments,
          has_media,
          has_line_items,
          has_assigned_routes,
          started_at,
          canceled_at,
          completed_at,
          status: {
            scheduled,
            inProgress,
            blocked,
            completed,
            needsApproval,
            approved,
            canceled,
            finalized,
            invoiced,
          },
        },
      });
    }

    this.ctxState.logger.debug(
      resultFieldSummary,
      'subsWosRepo->subscriptionOrdersWosSummary->fieldsSummary',
    );

    const subscriptionOrdersSummariesMap = {};
    resultFieldSummary.filter(Boolean).forEach(item => {
      const { id } = item;
      if (!subscriptionOrdersSummariesMap[id]) {
        subscriptionOrdersSummariesMap[id] = {
          subscriptionOrderId: id,
        };
      }
      subscriptionOrdersSummariesMap[id] = {
        ...subscriptionOrdersSummariesMap[id],
        ...item.fieldsSummary,
      };
    });
    this.ctxState.logger.debug(
      subscriptionOrdersSummariesMap,
      'subsWosRepo->subscriptionOrdersWosSummary->subscriptionOrdersSummariesMap',
    );

    const subscriptionOrdersSummary = Object.values(subscriptionOrdersSummariesMap);
    const result = subscriptionOrdersSummary.map(subscriptionOrderSummary => {
      const { total, subscriptionOrderId, ...rest } = subscriptionOrderSummary;

      const array_status = {};
      // eslint-disable-next-line array-callback-return
      Object.keys(SUBSCRIPTION_WO_STATUS).map(obj => {
        Object.assign(array_status, {
          [SUBSCRIPTION_WO_STATUS[obj]]: Number(rest.status[obj]) || 0,
        });
      });

      const summary = {
        subscriptionOrderId,
        total: Number(total),
        statuses: array_status,
      };

      if (!onlyTotals) {
        summary.hasMedia = !!subscriptionOrderSummary.hasMedia;
        summary.hasLineItems = !!subscriptionOrderSummary.hasLineItems;
        summary.hasComments = !!subscriptionOrderSummary.hasComments;
        summary.hasAssignedRoutes = !!subscriptionOrderSummary.hasAssignedRoutes;
        if (subscriptionOrderSummary.startedAt) {
          summary.startedAt = new Date(subscriptionOrderSummary.startedAt);
        }
      }

      const subOrder = subscriptionOrders.find(item => item.id === subscriptionOrderId);
      const nextStatus = mapSubOrderStatus(summary, cancellation);
      // pre-pricing service code
      // const oldStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(item => item === subOrder.status);
      // const nextStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(item => item === nextStatus);

      // summary.status =
      //   subOrder.status && nextStatusIndex < oldStatusIndex ? subOrder.status : nextStatus;
      // end pre-pricing service code
      // added for pricing
      const prevStatus = mapSubOrderStatus(summary, cancellation);
      const oldStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(item => item === subOrder.status);
      const nextStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(item => item === nextStatus);

      summary.status =
        subOrder.status && nextStatusIndex < oldStatusIndex ? prevStatus : nextStatus;
      // end added for pricing
      // This fix checks if serviceDate is future in order to keep current status.
      // if (subOrder.status && !(nextStatusIndex < oldStatusIndex || isFuture(parseISO(subOrder.serviceDate)))) {
      //   summary.status = nextStatus;
      // }

      return summary;
    });

    this.ctxState.logger.debug(result, 'subsWosRepo->subscriptionOrdersWosSummary->result');
    return result;
  }

  // pre-pricing service code
  // async softDeleteBySubscriptionsOrdersIds(
  //   { condition: { subscriptionsOrdersIds, ...condition }, statuses = [] },
  //   trx = this.knex,
  // ) {
  //   const whereCondition = unambiguousCondition(this.tableName, condition);

  //   const whereIn = [{ key: 'subscriptionOrderId', values: subscriptionsOrdersIds }];

  //   if (statuses.length) {
  //     whereIn.push({ key: 'status', values: statuses });
  //   }

  //   const deletedWorkOrders = await super.softDeleteBy({ condition: whereCondition, whereIn }, trx);
  async softDeleteBySubscriptionsOrdersIds({
    condition: { subscriptionsOrdersIds },
    statuses = [],
  }) {
    const deletedWorkOrders = await pricingSoftDeleteSubscriptionWorkOrder(this.getCtx(), {
      data: { subscriptionIds: subscriptionsOrdersIds, statuses },
    });

    return deletedWorkOrders || [];
  }

  async softDeleteByIds(ids, trx = this.knex) {
    await Promise.all(
      ids.map(id => super.softDeleteBy({ condition: { id } }, trx)),
      this,
    );
  }

  // pre-pricing service code
  // async updateStatusBySubscriptionsOrdersIds(
  //   { subscriptionsOrdersIds, statuses, status, fields = ['*'] } = {},
  //   trx,
  // ) {
  //   // can't be more than 100 due to our current system limitations
  //   const workOrders = await super
  //     .getAll(
  //       {
  //         condition: {},
  //         fields: ['id', 'status'],
  //       },
  //       trx,
  //     )
  //     .whereIn('subscriptionOrderId', subscriptionsOrdersIds)
  //     .whereIn('status', statuses);
  //   if (workOrders?.length) {
  //     const items = await this.updateMany(
  //       {
  //         data: workOrders.map(item => ({ ...item, status })),
  //         fields,
  //       },
  //       trx,
  //     );

  //     return items?.length
  //       ? items.map(item => compose(super.mapFields, super.camelCaseKeys)(item))
  //       : [];
  //   }
  //   return [];
  async updateStatusBySubscriptionsOrdersIds({ subscriptionsOrdersIds, statuses, status } = {}) {
    // can't be more than 100 due to our current system limitations
    const items = await pricingUpdateStatusBySubscriptionsOrdersIds(this.getCtx(), {
      data: { subscriptionsOrdersIds, statuses, status },
    });
    return items?.length
      ? items.map(item => compose(super.mapFields, super.camelCaseKeys)(item))
      : [];
  }

  async getByIdToLog(id, trx = this.knex) {
    const subscriptionWorkOrder = await this.getById({ id }, trx);

    return subscriptionWorkOrder
      ? compose(super.mapFields, super.camelCaseKeys)(subscriptionWorkOrder)
      : null;
  }
}

SubscriptionWorkOrdersRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionWorkOrdersRepository;
