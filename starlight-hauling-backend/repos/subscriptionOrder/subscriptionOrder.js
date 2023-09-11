/* eslint-disable no-unused-vars */
import { format } from 'date-fns';
import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/fp/omit.js';
import pick from 'lodash/fp/pick.js';
import has from 'lodash/has.js';
import compose from 'lodash/fp/compose.js';

import VersionedRepository from '../_versioned.js';
import SubscriptionRepo from '../subscription/subscription.js';
import SubscriptionServiceItemRepo from '../subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionWorkOrdersRepo from '../subscriptionWorkOrder.js';
import BillableServiceRepo from '../billableService.js';
import MaterialRepo from '../material.js';
import SubscriptionOrderLineItemRepo from '../subscriptionOrderLineItem.js';
import BillableLineItemRepo from '../billableLineItem.js';
import CustomRatesGroupServiceRepo from '../customRatesGroupService.js';
import CustomerRepo from '../customer.js';
import ContactsRepo from '../contact.js';
import ThirdPartyHaulersRepo from '../3rdPartyHaulers.js';
import PermitsRepo from '../permit.js';
import PurchaseOrderRepo from '../purchaseOrder.js';
import PromosRepo from '../promo.js';
import JobSiteRepo from '../jobSite.js';
import SubsriptionSurchargeRepo from '../subscriptionSurcharge.js';

import { shouldUpdateEquipmentItems } from '../../services/subscriptionOrders/shouldUpdateEquipmentItems.js';
import { validateCreditLimit } from '../../services/subscriptions/utils/validateCreditLimit.js';
import { extractFromRates } from '../../services/subscriptionOrders/utils/extractFromRates.js';
import { countFiltered } from '../../services/subscriptionOrders/countFiltered.js';

import { validateSubscriptionOrderCancel } from '../../services/subscriptionOrders/utils/validateSubscriptionOrderCancel.js';
import { validateSubscriptionOrderDependencies } from '../../services/subscriptionOrders/utils/validateSubscriptionOrderDependencies.js';
import { validateSubscriptionOrderServiceDate } from '../../services/subscriptionOrders/utils/validateSubscriptionOrderServiceDate.js';
import { publishers } from '../../services/ordersGeneration/publishers.js';
import { calcRates } from '../../services/orderRates.js';
import { getAvailableCredit } from '../../services/billing.js';
import { canGenerateOrders } from '../../services/subscriptions/utils/canGenerateOrders.js';
import { getDataForWorkOrders } from '../../services/subscriptionOrders/getDataForWorkOrders.js';
import { getEquipments } from '../../services/ordersGeneration/generateSubscriptionWorkOrders/publisher.js';

import {
  unambiguousCondition,
  unambiguousSelect,
  unambiguousTupleCondition,
} from '../../utils/dbHelpers.js';
import { mathRound2 } from '../../utils/math.js';

import ApiError from '../../errors/ApiError.js';

import {
  TABLE_NAME,
  getLinkedInputFields,
  subscriptionOrderFieldsForWos,
} from '../../consts/subscriptionOrders.js';
import { SORT_ORDER } from '../../consts/sortOrders.js';
import { SUBSCRIPTION_ORDERS_DEFAULT_SORTING } from '../../consts/subscriptionAttributes.js';
import { ONE_TIME_ACTION } from '../../consts/actions.js';
import { LINE_ITEM_TYPE } from '../../consts/lineItemTypes.js';
import { LEVEL_APPLIED } from '../../consts/purchaseOrder.js';
import {
  SUBSCRIPTION_ORDER_STATUSES,
  SUBSCRIPTION_ORDER_STATUS,
} from '../../consts/orderStatuses.js';
import { SUBSCRIPTION_WO_STATUS } from '../../consts/workOrder.js';

import { PHONE_TYPES } from '../../consts/phoneTypes.js';

import {
  pricingGetSubscriptionById,
  subscriptionServiceItemsById,
  pricingAddSubscriptionOrder,
  pricingSequenceCount,
  pricingPostManySubscriptionOrderLineItems,
  pricingGetSubscriptionsOrders,
  pricingGetSubscriptionOrderById,
  pricingUpsertSurcharge,
  pricingUpsertSubscriptionOrderMedia,
  pricingGetBySubscriptionIds,
  pricingSoftDeleteSubscriptionWorkOrder,
  pricingSoftDeleteSubscriptionOrder,
  pricingAlterStatusByIds,
  pricingGetSubscriptionOrder,
  pricingUpsertSubscriptionOrdersLineItems,
  pricingUpsertSubscriptionSurcharges,
  pricingUpdateSubscriptionWorkOrder,
  pricingUpdateManySubscriptionWorkOrder,
  pricingUpdateSubscriptionOrder,
  pricingUpdateStatuSubscriptionWorkOrders,
  pricingUpdateSubscriptionOrderBySubId,
  pricingGetSubscriptionOrderDetailsForRoutePlanner,
} from '../../services/pricing.js';
import { mapSubscriptionOrderCompletionDetails } from './utils/mapSubscriptionOrderCompletionDetails.js';
import { mapSubscriptionOrderCompletionFields } from './utils/mapSubscriptionOrderCompletionFields.js';
import { mapSubscriptionOrdersFromDb } from './utils/mapSubscriptionOrdersFromDb.js';
import { getPaginatedSortedListQuery } from './queries/getPaginatedSortedListQuery.js';
import { getDetailsByIdQuery } from './queries/getDetailsByIdQuery.js';
import { getNeedsApprovalSelect } from './queries/getNeedsApprovalSelect.js';
import { getWithSubscriptionById } from './queries/getWithSubscriptionById.js';

class SubscriptionOrdersRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['id'];
  }

  getCtx() {
    return {
      state: this.ctxState,
      logger: this.ctxState.logger,
    };
  }

  updateSubscriptionOrdersSummary(
    { id, status, billableLineItemsTotal, grandTotal } = {},
    trx = this.knex,
  ) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .update({
        status,
        billableLineItemsTotal,
        grandTotal,
      })
      .where({ id });
  }

  async getAllPaginated({
    skip = 0,
    limit,
    sortBy = SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
    sortOrder = SORT_ORDER.desc,
  } = {}) {
    const subscriptionOrders = await pricingGetSubscriptionsOrders(this.getCtx(), {
      skip,
      limit,
      sortBy,
      sortOrder,
    });
    // pre-pricing service code:
    // const subscriptionOrderLineItemRepo = SubscriptionOrderLineItemRepo.getInstance(this.ctxState);

    // const items = await query;

    // if (items?.length) {
    //   const itemsIndecies = items.reduce((res, item, idx) => {
    //     res[item.id] = idx;
    //     return res;
    //   }, {});
    //   const subsOrderLineItems = await subscriptionOrderLineItemRepo.getAllGroupedByOrder(
    //     items.map(item => item.id),
    //     trx,
    //   );

    //   if (subsOrderLineItems?.length) {
    //     subsOrderLineItems.forEach(item => {
    //       if (item.lineItems?.length) {
    //         items[itemsIndecies[item.subscriptionOrderId]].lineItems = item.lineItems;
    //       }
    //     });
    //   }
    // }

    // return items?.map(this.mapFields.bind(this)) ?? [];
    // end of pre-pricing service code
    return subscriptionOrders;
  }

  async count({ condition = {} } = {}, trx = this.knex) {
    const [total, ...countByStatus] = await Promise.all([
      countFiltered(this.schemaName, trx, { condition }),
      ...SUBSCRIPTION_ORDER_STATUSES.map(status =>
        countFiltered(this.schemaName, trx, {
          condition: { ...condition, status },
        }),
      ),
    ]);

    return {
      total,
      statuses: SUBSCRIPTION_ORDER_STATUSES.reduce(
        (obj, status, i) => Object.assign(obj, { [status]: countByStatus[i] }),
        {},
      ),
    };
  }

  async mapItems(items) {
    let lineItemsMap = {};
    if (!isEmpty(items)) {
      const subscriptionOrderLineItemRepo = SubscriptionOrderLineItemRepo.getInstance(
        this.ctxState,
      );
      const subscriptionOrdersIds = items.map(item => item.id);
      const lineItems = await subscriptionOrderLineItemRepo.getAllGroupedByOrder(
        subscriptionOrdersIds,
      );
      if (!isEmpty(lineItems)) {
        lineItemsMap = lineItems.reduce((res, item) => {
          if (!isEmpty(item)) {
            res[item.subscriptionOrderId] = item.lineItems;
          }
          return res;
        }, {});
      }
    }

    return isEmpty(items) ? [] : items.map(item => this.mapFields(item, { lineItemsMap }));
  }

  async getWithSubscriptionById({ id, fields = ['*'], whereIn } = {}, trx = this.knex) {
    const query = getWithSubscriptionById(trx, this.schemaName, this.userId, {
      id,
      fields,
      whereIn,
    });
    const item = await query;
    return isEmpty(item) ? null : this.mapFields(item);
  }

  // pre-pricing service code:
  // async getById(
  //   {
  //     id,
  //     fields = ['*'],
  //     joinedFields = [],
  //     whereIn,
  //     isCompletion = false,
  //     completed = false,
  //   } = {},
  //   trx = this.knex,
  // ) {
  //   const subscriptionOrderLineItemRepo = SubscriptionOrderLineItemRepo.getInstance(this.ctxState);

  //   const subscriptionOrderMediaRepo = SubscriptionOrderMediaRepo.getInstance(this.ctxState);

  //   const subscriptionWorkOrderRepo = SubscriptionWorkOrdersRepo.getInstance(this.ctxState);

  //   const query = getDetailsByIdQuery(trx, this.schemaName, this.userId, {
  //     id,
  //     fields,
  //     whereIn,
  //     joinedFields,
  //     completed,
  //   });

  //   const [item, lineItems, mediaFiles, workOrders] = await Promise.all([
  //     query,
  //     subscriptionOrderLineItemRepo.getAllGroupedByOrder([id], trx),
  //     subscriptionOrderMediaRepo.getAll({ condition: { subscriptionOrderId: id } }, trx),
  //     subscriptionWorkOrderRepo.getAllPaginated(
  //       { condition: { subscriptionOrderId: id }, isCompletion },
  //       trx,
  //     ),
  //   ]);
  //   const lineItemsMap = {};
  //   if (!isEmpty(lineItems) && !isEmpty(lineItems[0]?.lineItems)) {
  //     lineItemsMap[id] = lineItems[0]?.lineItems.filter(lineItem => !isEmpty(lineItem));
  //   }

  //   if (!isEmpty(mediaFiles)) {
  //     item.mediaFiles = mediaFiles;
  //   }

  //   item.workOrders = workOrders;

  //   return isEmpty(item)
  //     ? null
  //     : this.mapFields(Object.assign(item, mapSubscriptionOrderCompletionDetails(workOrders)), {
  //         lineItemsMap,
  //       });
  // }

  // end of pre-pricing service code
  getById({ id } = {}) {
    return pricingGetSubscriptionOrderById(this.getCtx(), { data: { id } });
  }

  async updateByIds({ ids, insertData }, trx = this.knex) {
    if (!ids.length) {
      return [];
    }

    const subscriptionOrders = [];
    for (const id of ids) {
      const subOrder = await pricingUpdateSubscriptionOrderBySubId(
        this.getCtx(),
        { data: insertData },
        id,
      );
      subscriptionOrders.push(subOrder);
    }

    return subscriptionOrders;
  }

  async getBySubscriptionId(
    { subscriptionId, condition, tupleConditions = [], fields = ['*'] } = {},
    trx = this.knex,
  ) {
    const subscriptionsServiceItemsTable = SubscriptionServiceItemRepo.TABLE_NAME;
    const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
    const materialsHT = MaterialRepo.getHistoricalTableName();
    const selects = [];
    selects.push(
      ...unambiguousSelect(this.tableName, fields),
      trx.raw('to_json(??.*) as ??', [subscriptionsServiceItemsTable, 'subscriptionServiceItem']),
      trx.raw('to_json(??.*) as ??', [billableServicesHT, 'billableService']),
      trx.raw('to_json(??.*) as ??', [materialsHT, 'material']),
    );
    const whereCondition = unambiguousCondition(this.tableName, condition);

    const preparedTupleConditions = unambiguousTupleCondition(this.tableName, tupleConditions);
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(
        subscriptionsServiceItemsTable,
        `${subscriptionsServiceItemsTable}.id`,
        `${this.tableName}.subscriptionServiceItemId`,
      )
      .innerJoin(
        billableServicesHT,
        `${billableServicesHT}.id`,
        `${this.tableName}.billableServiceId`,
      )
      .innerJoin(materialsHT, `${materialsHT}.id`, `${subscriptionsServiceItemsTable}.materialId`)
      .where(`${subscriptionsServiceItemsTable}.subscriptionId`, subscriptionId)
      .whereNull('deletedAt')
      .andWhere(whereCondition);

    // To be able to pass conditions: gt, like, etc...
    preparedTupleConditions?.forEach(tupleCondition => {
      query = query.andWhere(...tupleCondition);
    });

    const items = await query;

    return this.mapItems(items);
  }

  // pre-pricing service code:
  // async getBySubscriptionIds(
  //   {
  //     subscriptionIds,
  //     subscriptionServiceItemsIds,
  //     statuses,
  //     excludeTypes,
  //     types,
  //     condition,
  //     tupleConditions = [],
  //     fields = ['*'],
  //   } = {},
  //   trx = this.knex,
  // ) {
  //   const subscriptionsServiceItemsTable = SubscriptionServiceItemRepo.TABLE_NAME;
  //   const billableServicesHT = BillableServiceRepo.getHistoricalTableName();

  //   const preparedTupleConditions = unambiguousTupleCondition(this.tableName, tupleConditions);

  //   let query = trx(this.tableName)
  //     .withSchema(this.schemaName)
  //     .select(...unambiguousSelect(this.tableName, fields))
  //     .innerJoin(
  //       subscriptionsServiceItemsTable,
  //       `${subscriptionsServiceItemsTable}.id`,
  //       `${this.tableName}.subscriptionServiceItemId`,
  //     )
  //     .whereIn(`${subscriptionsServiceItemsTable}.subscriptionId`, subscriptionIds)
  //     .whereNull('deletedAt')
  //     .andWhere(unambiguousCondition(this.tableName, condition));

  //   if (types?.length || excludeTypes?.length) {
  //     query = query.innerJoin(
  //       billableServicesHT,
  //       ` ${billableServicesHT}.id`,
  //       `${this.tableName}.billableServiceId`,
  //     );
  //   }

  //   if (subscriptionServiceItemsIds?.length) {
  //     query = query.whereIn(
  //       `${this.tableName}.subscriptionServiceItemId`,
  //       subscriptionServiceItemsIds,
  //     );
  //   }
  //   if (statuses?.length) {
  //     query = query.whereIn(`${this.tableName}.status`, statuses);
  //   }
  //   if (types?.length) {
  //     query = query.whereIn(`${billableServicesHT}.action`, types);
  //   }
  //   if (excludeTypes?.length) {
  //     query = query.whereNotIn(`${billableServicesHT}.action`, excludeTypes);
  //   }

  //   // To be able to pass conditions: gt, like, etc...
  //   preparedTupleConditions?.forEach(tupleCondition => {
  //     query = query.andWhere(...tupleCondition);
  // end of pre-pricing service code
  async getBySubscriptionIds({
    subscriptionIds,
    subscriptionServiceItemsIds,
    statuses,
    excludeTypes,
    types,
    tupleConditions = [],
  } = {}) {
    const items = await pricingGetBySubscriptionIds(this.getCtx(), {
      data: {
        subscriptionIds,
        subscriptionServiceItemsIds,
        statuses,
        excludeTypes,
        types,
        tupleConditions,
      },
    });

    return this.mapItems(items);
  }

  async updateOne(
    {
      condition: { id, status },
      data: { lineItems, surcharges, ...data },
      skipLineItemsUpsert = false,
      fields = [],
      concurrentData,
      availableCredit,
      log = true,
    } = {},
    trx,
  ) {
    const linkedFields = getLinkedInputFields(data);

    const _trx = trx || (await this.knex.transaction());

    let order;

    try {
      const historicalLinkedFields = await this.getLinkedHistoricalIds(
        linkedFields,
        {
          update: data.updated,
          id,
        },
        _trx,
      );
      const oldOrder = await pricingGetSubscriptionOrder(this.getCtx(), { data: { id } });

      if (data.destinationJobSiteId) {
        const jobSite = await JobSiteRepo.getHistoricalInstance(this.ctxState).getBy({
          condition: { originalId: data.destinationJobSiteId },
          fields: ['id'],
        });
        data.destinationJobSiteId = jobSite?.destinationJobSiteId;
      }

      let billableLineItemsTotal = 0;

      if (lineItems?.length) {
        lineItems.forEach(lineItem => {
          billableLineItemsTotal += mathRound2(
            Number(lineItem.price || 0) * Number(lineItem.quantity || 1),
          );
        });
      }
      const price = has(data, 'price') ? data.price : oldOrder.price;
      const quantity = has(data, 'quantity') ? data.quantity : oldOrder.quantity;

      const serviceTotal = mathRound2(Number(price || 0) * Number(quantity || 1));

      data.billableLineItemsTotal = billableLineItemsTotal;
      // TODO make one source of true total calculations
      data.grandTotal = billableLineItemsTotal + serviceTotal;

      if (!skipLineItemsUpsert && !isEmpty(lineItems)) {
        await pricingUpsertSubscriptionOrdersLineItems(this.getCtx(), {
          data: lineItems.map(item => Object.assign(item, { subscriptionOrderId: id })),
        });
      }

      const wosData = getDataForWorkOrders({ data, oldOrder });

      if (!isEmpty(wosData) && data.workOrdersCount) {
        await pricingUpdateSubscriptionWorkOrder(this.getCtx(), {
          data: { ...wosData, subscriptionOrderId: id },
        });
      }

      if (shouldUpdateEquipmentItems(data, oldOrder)) {
        const wosList = oldOrder.workOrders;
        if (wosList?.length) {
          const { droppedItems, pickedUpItems } = getEquipments(data);
          const wosToUpdate = wosList.reduce((acc, item, index) => {
            if (
              wosList[index].droppedEquipmentItem !== droppedItems[index] ||
              wosList[index].pickedUpEquipmentItem !== pickedUpItems[index]
            ) {
              const updatedItem = {
                id: item.id,
                droppedEquipmentItem: droppedItems[index] ?? null,
                pickedUpEquipmentItem: pickedUpItems[index] ?? null,
              };
              return [...acc, updatedItem];
            }
            return [...acc];
          }, []);

          await pricingUpdateManySubscriptionWorkOrder(this.getCtx(), { data: wosToUpdate });
        }
      }

      const condition = {
        id,
      };

      if (status) {
        condition.status = status;
      }

      if (status && !oldOrder) {
        throw ApiError.invalidRequest(`Can transit order only with status: ${status}`);
      }
      validateSubscriptionOrderServiceDate(oldOrder, data);

      Object.assign(data, historicalLinkedFields);

      this.ctxState.logger.debug(
        `subsOrderRepo->updateOne->overrideCreditLimit: ${data.overrideCreditLimit}`,
      );
      this.ctxState.logger.debug(`subsOrderRepo->updateOne->availableCredit: ${availableCredit}`);
      if (!data.overrideCreditLimit) {
        if (oldOrder.overrideCreditLimit) {
          data.overrideCreditLimit = true;
        } else {
          const priceDifference = data.grandTotal - oldOrder.grandTotal;
          this.ctxState.logger.debug(
            `subsOrderRepo->updateOne->priceDifference: ${priceDifference}`,
          );
          if (priceDifference > 0) {
            validateCreditLimit(data, availableCredit, priceDifference);
          }
        }
      }

      // pre-pricing service code:
      // order = await super.updateBy(
      //   {
      //     condition,
      //     data,
      //     fields: Array.from(
      //       new Set([
      //         ...difference(fields, subscriptionOrderFieldsForWos),
      //         ...subscriptionOrderFieldsForWos.map(i => `${this.tableName}.${i}`),
      //       ]),
      //     ),
      //     concurrentData,
      //     log,
      //   },
      //   _trx,
      // );

      // // delete surcharges if empty array
      // if (surcharges) {
      //   const updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
      //     surcharges,
      //     { update: false },
      //     _trx,
      //   );

      //   await SubsriptionSurchargeRepo.getInstance(this.ctxState).upsertManyBy(
      //     {
      //       data: updatedOrderSurcharges.map(item => ({
      //         ...item,
      //         subscriptionId: oldOrder.subscriptionId,
      //         subcsriptionOrderId: id,
      //       })),
      //       condition: {
      //         subscriptionOrderId: id,
      //       },
      //     },
      // end of pre-pricing service code
      const newData = {
        ...omit(['startServiceDate'])(data),
        id,
      };

      await pricingUpdateSubscriptionOrder(this.getCtx(), {
        data: newData,
      });

      order = newData;

      // delete surcharges if empty array
      if (!isEmpty(surcharges)) {
        const updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          surcharges,
          { update: false },
          _trx,
        );
        const subsriptionSurchargeData = updatedOrderSurcharges.map(item => ({
          ...item,
          subscriptionId: oldOrder.subscriptionId,
          subcsriptionOrderId: id,
        }));
        await pricingUpsertSubscriptionSurcharges(this.getCtx(), {
          data: subsriptionSurchargeData,
        });
      }

      if (lineItems?.length) {
        order.lineItems = lineItems;
      }

      if (oldOrder.purchaseOrderId !== order.purchaseOrderId) {
        await PurchaseOrderRepo.getInstance(this.ctxState)
          .checkIfShouldRemoveLevelAppliedValue(oldOrder.purchaseOrderId, trx)
          .order();
      }

      const shouldApplyPuchaseOrderLevelAppliedValue =
        order.purchaseOrderId &&
        oldOrder.purchaseOrderId &&
        order.purchaseOrderId !== oldOrder.purchaseOrderId;

      if (shouldApplyPuchaseOrderLevelAppliedValue) {
        await PurchaseOrderRepo.getInstance(this.ctxState).applyLevelAppliedValue(
          {
            id: data.purchaseOrderId,
            applicationLevel: LEVEL_APPLIED.order,
          },
          trx,
        );
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

    return order;
  }

  mapFields(originalObj, { skipNested, lineItemsMap } = {}) {
    return mapSubscriptionOrdersFromDb(originalObj, {
      skipNested,
      lineItemsMap,
      // in case if will be copy-pasted and `this` will be used in parent
      parentMapper: super.mapFields.bind(this),
      instance: this,
    });
  }

  async getOrderSurchargeHistoricalIds(orderSurcharges, { update = false } = {}, trx = this.knex) {
    const surchargeArray = orderSurcharges ? Array.from({ length: orderSurcharges.length }) : [];
    const entityRepo = SubsriptionSurchargeRepo.getInstance(this.ctxState);

    if (!isEmpty(orderSurcharges)) {
      const pickIds = pick([
        'surchargeId',
        'materialId',
        'globalRatesSurchargesId',
        'customRatesGroupSurchargesId',
        'billableServiceId',
        'billableLineItemId',
      ]);
      await Promise.all(
        orderSurcharges.map(async (item, i) => {
          const updatedItem = await super.getLinkedHistoricalIds(
            pickIds(item),
            {
              update: !!(update && item?.id),
              entityId: item?.id,
              entityRepo,
            },
            trx,
          );

          surchargeArray[i] = { ...item, ...updatedItem };
        }, this),
      );
    }

    return surchargeArray;
  }

  async getSequenceId(subscriptionId) {
    // Calling Pricing Microservice
    const sequenceId = await pricingSequenceCount(this.getCtx(), { data: { id: subscriptionId } });

    return sequenceId;
  }

  async createOne({ data: { surcharges, ...data }, availableCredit, log }, trx) {
    const { subscriptionId } = data;
    const linkedFields = getLinkedInputFields(data);

    const _trx = trx || (await this.knex.transaction());

    const sequenceId = await this.getSequenceId(subscriptionId);

    let subscriptionOneTimeOrder = null;
    let action = null;

    try {
      const promises = [
        this.getLinkedHistoricalIds(
          linkedFields,
          {
            update: false,
          },
          _trx,
        ),
      ];

      if (data.destinationJobSiteId) {
        const { id: destinationJobSiteId } = await JobSiteRepo.getHistoricalInstance(
          this.ctxState,
        ).getBy({
          condition: { originalId: data.destinationJobSiteId },
          fields: ['id'],
        });
        data.destinationJobSiteId = destinationJobSiteId;
      }

      if (data.billableServiceId) {
        promises.push(
          BillableServiceRepo.getInstance(this.ctxState).getById(
            {
              id: data.billableServiceId,
              fields: ['id', 'action', 'oneTime', 'description'],
            },
            _trx,
          ),
        );
      } else {
        promises.push(
          BillableServiceRepo.getHistoricalInstance(this.ctxState).getBy(
            {
              condition: {
                active: true,
                oneTime: true,
                action: ONE_TIME_ACTION.notService,
              },
              fields: ['*'],
            },
            _trx,
          ),
        );
      }

      const [historicalLinkedFields, billableService] = await Promise.all(promises);
      ({ action } = billableService);

      // Calling Pricing Microservice
      const subscription = await pricingGetSubscriptionById(this.getCtx(), { id: subscriptionId });
      await this.proceedPurchaseOrder(data, trx);

      this.ctxState.logger.debug(subscription, 'subsOrderRepo->createOne->subscription');
      this.ctxState.logger.debug(billableService, 'subsOrderRepo->createOne->billableService');
      this.ctxState.logger.debug(action, 'subsOrderRepo->createOne->action');

      validateSubscriptionOrderDependencies(data, subscription, billableService);

      Object.assign(data, historicalLinkedFields);

      // pre-pricing service code:
      // const subscriptionServiceItem = await SubscriptionServiceItemRepo.getInstance(
      //   this.ctxState,
      // ).getBy(
      //   {
      //     condition: {
      //       quantity: 0,
      //       price: 0,
      //       subscriptionId: subscription.id,
      //     },
      //     fields: ['id'],
      //   },
      //   _trx,
      // );
      // end of pre-pricing service code
      // Calling Pricing Microservice
      const subscriptionServiceItem = await subscriptionServiceItemsById(this.getCtx(), {
        subscriptionId,
      });

      data.subscriptionServiceItemId = subscriptionServiceItem.id;

      this.ctxState.logger.debug(`subsOrderRepo->createOne->availableCredit: ${availableCredit}`);
      validateCreditLimit(data, availableCredit);

      // pre-pricing service code:
      // subscriptionOneTimeOrder = await super.createOne(
      //   {
      //     data: {
      //       ...omit(['businessLineId', 'lineItems', 'customerId', 'oneTimePurchaseOrderNumber'])(
      //         data,
      //       ),
      //       oneTime: true,
      //       canReschedule: true, // TODO: clarify with BA
      //       sequenceId: `${data.subscriptionId}.${sequenceId + 1}`,
      //       subscriptionId: data.subscriptionId,
      //       billableServiceId: data.billableServiceId || billableService.id,
      //     },
      //     fields: Array.from(
      //       new Set([
      //         ...difference(fields, subscriptionOrderFieldsForWos),
      //         ...subscriptionOrderFieldsForWos.map(i => `${this.tableName}.${i}`),
      //       ]),
      //     ),
      // end of pre-pricing service code
      // Calling Pricing Microservice
      subscriptionOneTimeOrder = await pricingAddSubscriptionOrder(this.getCtx(), {
        data: {
          ...omit([
            'businessLineId',
            'lineItems',
            'customerId',
            'oneTimePurchaseOrderNumber',
            !data.callOnWayPhoneNumber ? 'callOnWayPhoneNumber' : '',
            !data.textOnWayPhoneNumber ? 'textOnWayPhoneNumber' : '',
            !data.instructionsForDriver ? 'instructionsForDriver' : '',
            !data.bestTimeToComeFrom ? 'bestTimeToComeFrom' : '',
            !data.bestTimeToComeTo ? 'bestTimeToComeTo' : '',
            !data.assignedRoute ? 'assignedRoute' : '',
          ])(data),
          oneTime: true,
          canReschedule: true, // TODO: clarify with BA
          sequenceId: `${data.subscriptionId}.${sequenceId + 1}`,
          subscriptionId: data.subscriptionId,
          billableServiceId: data.billableServiceId || billableService.id,
        },
      });

      this.ctxState.logger.debug(
        subscriptionOneTimeOrder,
        'subsOrderRepo->createOne->subscriptionOneTimeOrder',
      );
      // pre-pricing service code:

      // this.ctxState.logger.debug(
      //   subscriptionOneTimeOrder,
      //   'subsOrderRepo->createOne->subscriptionOneTimeOrder',
      // );

      // end of pre-pricing service code
      // Todo Purchase is from hauling?
      if (subscriptionOneTimeOrder.purchaseOrderId) {
        await PurchaseOrderRepo.getInstance(this.ctxState).applyLevelAppliedValue(
          {
            id: subscriptionOneTimeOrder.purchaseOrderId,
            applicationLevel: LEVEL_APPLIED.order,
          },
          trx,
        );
      }

      data.subscriptionOrderId = subscriptionOneTimeOrder.id;
      data.status = subscription.status;

      if (!isEmpty(surcharges)) {
        const updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          surcharges,
          { update: false },
          // pre-pricing service code:
          //   _trx,
          // );

          // await SubsriptionSurchargeRepo.getInstance(this.ctxState).upsertManyBy(
          //   {
          //     data: updatedOrderSurcharges.map(item => ({
          //       ...item,
          //       subscriptionId: subscription.id,
          //       subscriptionOrderId: data.subscriptionOrderId,
          //     })),
          //     condition: {
          //       subscriptionOrderId: data.subscriptionOrderId,
          //     },
          //   },
          // end of pre-pricing service code
          _trx,
        );

        // ToDo: Create the upsert many for subscripcion surcharges
        // author Esteban Navarro
        await pricingUpsertSurcharge(this.getCtx(), {
          data: {
            data: updatedOrderSurcharges.map(item =>
              Object.assign(item, {
                subscriptionId: subscription.id,
                subscriptionOrderId: data.subscriptionOrderId,
              }),
            ),
            id: data.subscriptionOrderId,
          },
        });
      }

      if (!isEmpty(data.lineItems)) {
        // pre-pricing service code:
        // await SubscriptionOrderLineItemRepo.getInstance(this.ctxState).insertMany(
        //   {
        // end of pre-pricing service code
        await pricingPostManySubscriptionOrderLineItems(this.getCtx(), {
          data: {
            data: data.lineItems.map(lineItem => {
              lineItem.subscriptionOrderId = data.subscriptionOrderId;
              lineItem.customRatesGroupLineItemsId = data.customRatesGroupLineItemsId;
              return lineItem;
            }),
          },
        });
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (err) {
      if (!trx) {
        await _trx.rollback();
      }

      throw err;
    }

    log && this.log({ id: subscriptionOneTimeOrder.id, action: this.logAction.create });

    this.ctxState.logger.debug(data, 'subsOrderRepo->createOne->data');

    const canGenerateWorkOrders =
      subscriptionOneTimeOrder && canGenerateOrders(data, action) && data.billableServiceId;

    if (canGenerateWorkOrders) {
      const { id: subscriptionOrderId, ...template } = pick(subscriptionOrderFieldsForWos)(
        subscriptionOneTimeOrder,
      );

      await publishers.generateSubscriptionWorkOrders(this.getCtx(), {
        schema: this.schemaName,
        userId: this.userId,
        templates: [
          {
            ...template,
            subscriptionId: data.subscriptionId,
            subscriptionOrderId,
          },
        ],
      });
    }

    return subscriptionOneTimeOrder;
  }

  async softDeleteById({ id, log }) {
    await pricingSoftDeleteSubscriptionWorkOrder(this.getCtx(), {
      data: { subscriptionIds: [id] },
    });

    await pricingSoftDeleteSubscriptionOrder(this.getCtx(), { data: { subscriptionIds: [id] } });

    log && this.log({ id, action: this.logAction.delete });
  }

  async softDeleteByIds({ ids, log }, trx = this.knex) {
    await Promise.all(
      ids.map(id => this.softDeleteById({ id, log }, trx)),
      this,
    );
  }

  async softDeleteWithWOByIds({ ids, log }, trx = this.knex) {
    const subsWosRepo = SubscriptionWorkOrdersRepo.getInstance(this.ctxState);
    const deletedWorkOrders = await subsWosRepo.softDeleteBySubscriptionsOrdersIds(
      { condition: { subscriptionsOrdersIds: ids } },
      trx,
    );
    // pre-pricing service code:

    // await this.softDeleteByIds({ ids, log }, trx);
    // end of pre-pricing service code
    // await this.softDeleteByIds({ ids, log }, trx);
    await pricingSoftDeleteSubscriptionOrder(this.getCtx(), { data: { subscriptionIds: ids } });
    log && this.log({ ids, action: this.logAction.delete });

    return deletedWorkOrders;
  }

  async cleanScheduledOrders(
    {
      subscriptionIds,
      condition,
      subscriptionServiceItemsIds,
      effectiveDate,
      types,
      excludeTypes,
      deletedWorkOrders = [],
      log,
    },
    trx = this.knex,
  ) {
    try {
      const tupleConditions = [];
      if (effectiveDate) {
        tupleConditions.push(['serviceDate', '>=', effectiveDate.toISOString()]);
      }
      const scheduledOrders = await this.getBySubscriptionIds(
        {
          subscriptionIds,
          condition,
          subscriptionServiceItemsIds,
          statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
          types,
          excludeTypes,
          tupleConditions,
          fields: ['id'],
        },
        trx,
      );

      if (scheduledOrders?.length) {
        const scheduledOrdersIds = scheduledOrders.map(item => item.id);
        this.ctxState.logger.debug(
          scheduledOrdersIds,
          'subsOrderRepo->cleanScheduledOrders->scheduledOrdersIds',
        );
        const deletedWos = await this.softDeleteWithWOByIds({ ids: scheduledOrdersIds, log }, trx);
        deletedWorkOrders.push(...deletedWos);
      }
    } catch (err) {
      this.ctxState.logger.error(err.message, 'subsOrderRepo->cleanScheduledOrders');
      throw err;
    }
  }

  async cleanInProgressOrders(
    {
      subscriptionIds,
      condition,
      subscriptionServiceItemsIds,
      effectiveDate,
      types,
      excludeTypes,
      deletedWorkOrders = [],
      updatedWorkOrders = [],
      log,
    },
    trx = this.knex,
  ) {
    const subsWosRepo = SubscriptionWorkOrdersRepo.getInstance(this.ctxState);

    try {
      const tupleConditions = [];
      if (effectiveDate) {
        tupleConditions.push(['serviceDate', '>=', effectiveDate.toISOString()]);
      }
      const inProgressOrders = await this.getBySubscriptionIds(
        {
          subscriptionIds,
          subscriptionServiceItemsIds,
          condition,
          statuses: [SUBSCRIPTION_ORDER_STATUS.inProgress],
          types,
          excludeTypes,
          tupleConditions,
          fields: ['id', 'status'],
          log,
        },
        trx,
      );

      if (inProgressOrders?.length) {
        const inProgressOrdersIds = inProgressOrders.map(item => item.id);
        this.ctxState.logger.debug(
          inProgressOrdersIds,
          'subsOrderRepo->cleanInProgressOrders->inProgressOrdersIds',
        );

        const inProgressOrdersSummary = await subsWosRepo.subscriptionOrdersWosSummary(
          {
            subscriptionOrders: inProgressOrders,
            onlyTotals: true,
          },
          trx,
        );
        this.ctxState.logger.debug(
          inProgressOrdersSummary,
          'subsOrderRepo->cleanInProgressOrders->inProgressOrdersSummary',
        );

        const ordersIdsToComplete = inProgressOrdersSummary
          .filter(item => item.status === SUBSCRIPTION_ORDER_STATUS.completed)
          .map(item => item.subscriptionOrderId);
        const ordersIdsToCancel = inProgressOrdersSummary
          .filter(item => item.status === SUBSCRIPTION_ORDER_STATUS.canceled)
          .map(item => item.subscriptionOrderId);
        this.ctxState.logger.debug(
          ordersIdsToComplete,
          'subsOrderRepo->cleanInProgressOrders->ordersIdsToComplete',
        );
        this.ctxState.logger.debug(
          ordersIdsToCancel,
          'subsOrderRepo->cleanInProgressOrders->ordersIdsToCancel',
        );

        const [deletedWos, updatedWos] = await Promise.all([
          subsWosRepo.softDeleteBySubscriptionsOrdersIds(
            {
              condition: {
                subscriptionsOrdersIds: inProgressOrdersIds,
                status: SUBSCRIPTION_WO_STATUS.scheduled,
              },
              log,
            },
            trx,
          ),
          subsWosRepo.updateStatusBySubscriptionsOrdersIds({
            subscriptionsOrdersIds: inProgressOrdersIds,
            statuses: [SUBSCRIPTION_WO_STATUS.inProgress],
            status: SUBSCRIPTION_WO_STATUS.canceled,
          }),
          !ordersIdsToComplete.length
            ? null
            : pricingAlterStatusByIds(this.getCtx(), {
                data: {
                  ids: ordersIdsToComplete,
                  data: { status: SUBSCRIPTION_ORDER_STATUS.completed },
                },
              }),
          !ordersIdsToCancel.length
            ? null
            : pricingAlterStatusByIds(this.getCtx(), {
                data: {
                  ids: ordersIdsToCancel,
                  data: {
                    status: SUBSCRIPTION_ORDER_STATUS.canceled,
                    cancellationReason: 'canceledDueToOnHold',
                  },
                },
              }),
        ]);

        deletedWorkOrders.push(...deletedWos);
        updatedWorkOrders.push(...updatedWos);
      }
    } catch (err) {
      this.ctxState.logger.error(err.message, 'subsOrderRepo->cleanInProgressOrders');
      throw err;
    }
  }

  async cleanOrders(
    {
      subscriptionIds,
      subscriptionServiceItemsIds,
      effectiveDate,
      statuses,
      types,
      excludeTypes,
      condition,
      log = true,
    },
    trx = this.knex,
  ) {
    const deletedWorkOrders = [];
    const updatedWorkOrders = [];
    try {
      this.ctxState.logger.debug(
        {
          subscriptionIds,
          subscriptionServiceItemsIds,
          effectiveDate: effectiveDate && format(effectiveDate, 'yyyy-MM-dd HH:mm:ss'),
          types,
          excludeTypes,
        },
        'subsOrderRepo->cleanOrders->args',
      );
      await this.cleanScheduledOrders(
        {
          subscriptionIds,
          subscriptionServiceItemsIds,
          effectiveDate,
          types,
          excludeTypes,
          condition,
          deletedWorkOrders,
          log,
        },
        trx,
      );
      await this.cleanInProgressOrders(
        {
          subscriptionIds,
          subscriptionServiceItemsIds,
          effectiveDate,
          statuses,
          types,
          excludeTypes,
          condition,
          deletedWorkOrders,
          updatedWorkOrders,
          log,
        },
        trx,
      );

      return {
        deletedWorkOrders,
        updatedWorkOrders,
      };
    } catch (err) {
      this.ctxState.logger.error(err.message, 'subsOrderRepo->cleanOrders');
      throw err;
    }
  }

  // insertMany from VersionedRepo use this.createOne instead super
  async insertMany({ subscriptionId, data: dataArr, fields = [], log }, trx) {
    const _trx = trx || (await this.knex.transaction());

    let items;
    try {
      const sequenceId = await this.getSequenceId(subscriptionId, _trx);

      items = await Promise.all(
        dataArr.map((data, i) =>
          pricingAddSubscriptionOrder(this.getCtx(), {
            data: {
              data: {
                ...data,
                subscriptionId,
                sequenceId: `${subscriptionId}.${sequenceId + i + 1}`,
              },
            },
          }),
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

    if (log && items.length) {
      items.forEach(({ id }) => {
        this.log({ id, action: this.logAction.create });
      });
    }

    return items;
  }

  // eslint-disable-next-line no-unused-vars
  async transitStatus(
    { condition: { id, status }, concurrentData, data: { workOrder, ...data }, fields = ['*'] },
    trx,
  ) {
    if (data.noBillableService && data.completionFields) {
      throw ApiError.invalidRequest(`completionFields forbidden when noBillableService`);
    }

    let updatedOrder;
    const _trx = trx || (await this.knex.transaction());

    const oldOrder = await this.getById({ id }, trx);
    const { availableCredit } = await getAvailableCredit(this.getCtx(), {
      customerId: oldOrder.customer.originalId,
    });
    this.ctxState.logger.debug(
      `subsOrderRepo->transitStatus->overrideCreditLimit: ${data.overrideCreditLimit}`,
    );
    this.ctxState.logger.debug(`subsOrderRepo->transitStatus->availableCredit: ${availableCredit}`);
    this.ctxState.logger.debug(
      `subsOrderRepo->transitStatus->old grandTotal: ${oldOrder.grandTotal}`,
    );
    this.ctxState.logger.debug(`subsOrderRepo->transitStatus->new grandTotal: ${data.grandTotal}`);
    if (!data.overrideCreditLimit) {
      const priceDifference = data.grandTotal - oldOrder.grandTotal;
      this.ctxState.logger.debug(
        `subsOrderRepo->transitStatus->priceDifference: ${priceDifference}`,
      );
      if (priceDifference > 0) {
        validateCreditLimit(data, availableCredit, priceDifference);
      }
    }

    const insertData = mapSubscriptionOrderCompletionFields(data);
    try {
      updatedOrder = await this.updateOne(
        {
          condition: { id, status },
          data: {
            ...insertData,
            uncompletedComment: '',
            unapprovedComment: '',
            unfinalizedComment: '',
          },
          fields,
          concurrentData,
        },
        _trx,
      );

      if (!data.noBillableService && data.fields) {
        await pricingUpsertSubscriptionOrderMedia(this.getCtx(), {
          data: data.mediaFiles.map(item => Object.assign(item, { subscriptionOrderId: id })),
        });
      }

      this.ctxState.logger.debug(updatedOrder, 'subsOrderRepo->transitStatus->updatedOrder');

      if (!isEmpty(workOrder)) {
        const updatedWorkOrders = await pricingUpdateSubscriptionWorkOrder(this.getCtx(), {
          data: {
            id,
            ...workOrder,
          },
        });
        this.ctxState.logger.debug(
          updatedWorkOrders,
          'subsOrderRepo->transitStatus->updatedWorkOrders',
        );
        // pre-pricing service code:

        //   this.ctxState.logger.debug(
        //     updatedWorkOrders,
        //     'subsOrderRepo->transitStatus->updatedWorkOrders',
        //   );
        // }

        // if (!trx) {
        //   await _trx.commit();
        // end pre-pricing service code
      }
    } catch (error) {
      this.ctxState.logger.error(error);
      throw error;
    }

    return updatedOrder;
  }

  async cancelOne({ id, data: { addTripCharge, reasonType, comment, log } } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());
    let canceledOrder;

    try {
      const subOrder = await pricingGetSubscriptionOrderById(this.getCtx(), { data: { id } });
      validateSubscriptionOrderCancel(id, subOrder);
      const newData = {
        cancellationReason: reasonType || '',
        cancellationComment: comment || null,
        lineItems: [],
        price: 0,
        grandTotal: 0,
      };

      if (addTripCharge) {
        const tripCharge = await this.addTripCharge({ subOrder }, trx);
        newData.billableLineItemsTotal = tripCharge.price;
        newData.lineItems = [tripCharge];
      }

      canceledOrder = await this.updateOne(
        {
          condition: { id },
          data: {
            status: SUBSCRIPTION_ORDER_STATUS.canceled,
            price: 0,
            ...newData,
          },
          fields: ['*'],
        },
        trx,
      );

      await pricingUpdateStatuSubscriptionWorkOrders(this.getCtx(), {
        data: { status: SUBSCRIPTION_ORDER_STATUS.canceled, subscriptionOrderId: id },
      });

      log && this.log({ id, action: this.logAction.modify });

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return canceledOrder;
  }

  async addTripCharge({ subOrder }, trx) {
    const businessUnitId = subOrder.businessUnit.id;
    const businessLineId = subOrder.businessUnit.id;

    const customRatesGroupId = subOrder.customRatesGroupId ?? null;

    const tripChargeLineItem = await BillableLineItemRepo.getInstance(this.ctxState).getBy(
      {
        condition: {
          type: LINE_ITEM_TYPE.tripCharge,
          businessLineId,
        },
        fields: ['id'],
      },
      trx,
    );

    const ratesObj = await calcRates(
      this.ctxState,
      {
        businessUnitId,
        businessLineId,
        type: customRatesGroupId ? 'custom' : 'global',
        customRatesGroupId,
        billableLineItems: [
          {
            lineItemId: tripChargeLineItem.id,
            materialId: null,
          },
        ],
      },
      trx,
    );

    const { globalRatesLineItemsId, customRatesGroupLineItemsId, price } =
      extractFromRates(ratesObj);

    if (!price) {
      throw ApiError.notFound('Global rates for Trip Charge billable line item not found');
    }

    return {
      billableLineItemId: tripChargeLineItem.id,
      globalRatesLineItemsId,
      customRatesGroupLineItemsId: customRatesGroupLineItemsId || null,
      price,
      quantity: 1,
      unlockOverrides: false,
    };
  }

  async getSumNotInvoicedTotal({ customerId } = {}, trx = this.knex) {
    const customerHT = CustomerRepo.getHistoricalTableName();
    const { sumNotInvoicedTotal } = await trx(this.tableName)
      .withSchema(this.schemaName)
      .sum({ sumNotInvoicedTotal: `${this.tableName}.grandTotal` })
      .innerJoin(
        SubscriptionServiceItemRepo.TABLE_NAME,
        `${SubscriptionServiceItemRepo.TABLE_NAME}.id`,
        `${this.tableName}.subscriptionServiceItemId`,
      )
      .innerJoin(
        SubscriptionRepo.TABLE_NAME,
        `${SubscriptionRepo.TABLE_NAME}.id`,
        `${SubscriptionServiceItemRepo.TABLE_NAME}.subscriptionId`,
      )
      .innerJoin(customerHT, `${customerHT}.id`, `${SubscriptionRepo.TABLE_NAME}.customerId`)
      .where(`${customerHT}.originalId`, customerId)
      .whereNull(`${this.tableName}.invoicedDate`)
      .andWhere(`${this.tableName}.oneTime`, true)
      .first();

    return Number(sumNotInvoicedTotal) || 0;
  }

  // pre-pricing service code:
  // async getItemBySpecificDate({ subscriptionOrderId, fields = ['*'], withOriginalIds = false }) {
  //   this.ctxState.logger.debug(
  //     `subsOrderRepo->getItemBySpecificDate->subscriptionOrderId: ${subscriptionOrderId}`,
  //   );
  //   const customRatesGroupServiceHT = CustomRatesGroupServiceRepo.getHistoricalTableName();
  //   const contactsRepoHT = ContactsRepo.getHistoricalTableName();

  //   const selects = [...unambiguousSelect(this.tableName, fields)];
  //   let query = this.knex(this.tableName)
  //     .withSchema(this.schemaName)
  //     .where(`${this.tableName}.id`, subscriptionOrderId)
  //     .orderByRaw(`${this.tableName}.created_at::timestamp desc`);

  //   if (withOriginalIds) {
  //     const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
  //     const materialsHT = MaterialRepo.getHistoricalTableName();
  //     const permitsHT = PermitsRepo.getHistoricalTableName();
  //     const promosHT = PromosRepo.getHistoricalTableName();
  //     query = query
  //       .innerJoin(
  //         billableServicesHT,
  //         `${this.tableName}.billableServiceId`,
  //         `${billableServicesHT}.id`,
  //       )
  //       .leftJoin(
  //         customRatesGroupServiceHT,
  //         `${this.tableName}.customRatesGroupServicesId`,
  //         `${customRatesGroupServiceHT}.id`,
  //       )
  //       .leftJoin(materialsHT, `${this.tableName}.materialId`, `${materialsHT}.id`)
  //       .leftJoin(`"${contactsRepoHT}" as jsc`, `${this.tableName}.jobSiteContactId`, `jsc.id`)
  //       .leftJoin(`"${contactsRepoHT}" as sc`, `${this.tableName}.subscriptionContactId`, `sc.id`)
  //       .leftJoin(permitsHT, `${this.tableName}.permitId`, `${permitsHT}.id`)
  //       .leftJoin(promosHT, `${this.tableName}.promoId`, `${promosHT}.id`);
  //     selects.push(
  //       `${billableServicesHT}.originalId as billableServiceOriginalId`,
  //       `${materialsHT}.originalId as materialOriginalId`,
  //       `${customRatesGroupServiceHT}.customRatesGroupId as customRatesGroupOriginalId`,
  //       `jsc.originalId as jobSiteContactOriginalId`,
  //       `sc.originalId as subscriptionContactOriginalId`,
  //       `${permitsHT}.originalId as permitOriginalId`,
  //       `${promosHT}.originalId as promoOriginalId`,
  //     );
  //   }
  //   query = query.first(selects);
  // end pre-pricing service code
  async getItemBySpecificDate({ subscriptionOrderId, withOriginalIds = false }) {
    this.ctxState.logger.debug(
      `subsOrderRepo->getItemBySpecificDate->subscriptionOrderId: ${subscriptionOrderId}`,
    );
    const subscription = await pricingGetSubscriptionOrderById(this.getCtx(), {
      data: { id: subscriptionOrderId },
    });
    let result = subscription;

    if (withOriginalIds) {
      const { billableServiceId } = subscription;
      const { materialId } = subscription;
      const { permitId } = subscription;
      const { promoId } = subscription;
      const { jobSiteContactId } = subscription;
      const { subscriptionContactId } = subscription;
      const { customRatesGroupServicesId } = subscription;
      // end post-pricing service code

      const billableServiceOriginalId = billableServiceId
        ? await BillableServiceRepo.getHistoricalInstance(this.getCtx().state).getBy({
            condition: { id: billableServiceId },
          })
        : null;
      const materialOriginalId = materialId
        ? await MaterialRepo.getHistoricalInstance(this.getCtx().state).getBy({
            condition: { id: materialId },
          })
        : null;
      const customRatesGroupOriginalId = customRatesGroupServicesId
        ? await CustomRatesGroupServiceRepo.getHistoricalInstance(this.getCtx().state).getBy({
            condition: { id: customRatesGroupServicesId },
          })
        : null;
      const jobSiteContactOriginalId = jobSiteContactId
        ? await ContactsRepo.getHistoricalInstance(this.getCtx().state).getBy({
            condition: { id: jobSiteContactId },
          })
        : null;
      const subscriptionContactOriginalId = subscriptionContactId
        ? await ContactsRepo.getHistoricalInstance(this.getCtx().state).getBy({
            condition: { id: subscriptionContactId },
          })
        : null;
      const permitOriginalId = permitId
        ? await PermitsRepo.getHistoricalInstance(this.getCtx().state).getBy({
            condition: { id: permitId },
          })
        : null;
      const promoOriginalId = promoId
        ? await PromosRepo.getHistoricalInstance(this.getCtx().state).getRecentBy({
            condition: { originalId: promoId },
          })
        : null;

      const res = {
        billableServiceOriginalId: billableServiceOriginalId?.originalId || null,
        materialOriginalId: materialOriginalId?.originalId || null,
        customRatesGroupOriginalId: customRatesGroupOriginalId?.originalId || null,
        jobSiteContactOriginalId: jobSiteContactOriginalId?.originalId || null,
        subscriptionContactOriginalId: subscriptionContactOriginalId?.originalId || null,
        permitOriginalId: permitOriginalId?.originalId || null,
        promoOriginalId: promoOriginalId?.originalId || null,
      };
      result = res;
    }

    this.ctxState.logger.debug(result, 'subsOrderRepo->getItemBySpecificDate->result');
    return result;
  }

  async getByIdToLog(id, trx = this.knex) {
    const subscriptionOrder = await super.getById(
      {
        id,
      },
      trx,
    );

    return subscriptionOrder
      ? compose(super.mapFields, super.camelCaseKeys)(subscriptionOrder)
      : null;
  }

  async getInvalidOrders(
    { condition: { status }, ids, businessUnitId, fields = ['*'] },
    trx = this.knex,
  ) {
    // pre-pricing service code:
    // const subsWorkOrderTable = SubscriptionWorkOrdersRepo.TABLE_NAME;
    // const subscriptionTable = SubscriptionRepo.TABLE_NAME;

    // let query = trx(this.tableName)
    //   .withSchema(this.schemaName)
    //   .andWhere({ businessUnitId })
    //   .select(unambiguousSelect(this.tableName, fields))
    //   .innerJoin(subscriptionTable, `${this.tableName}.subscriptionId`, `${subscriptionTable}.id`)
    //   .whereExists(builder => {
    //     builder
    //       .select(`${subsWorkOrderTable}.id`)
    //       .withSchema(this.schemaName)
    //       .from(subsWorkOrderTable)
    //       .whereRaw(`??.subscription_order_id = ??.id`, [subsWorkOrderTable, this.tableName])
    //       .andWhere(q =>
    //         q
    //           .whereNull(`${subsWorkOrderTable}.truckNumber`)
    //           .orWhereNull(`${subsWorkOrderTable}.assignedRoute`)
    //           .orWhereNull(`${subsWorkOrderTable}.completedAt`),
    //       );
    // end pre-pricing service code
    const filters = { businessUnitId };
    if (status) {
      filters.status = status;
    }
    if (ids) {
      filters.ids = ids;
    }
    let result = await pricingGetSubscriptionsOrders(this.getCtx(), {
      data: { ...filters, skip: 0, limit: 0, sortBy: 'id', sortOrder: 'ASC' },
    });
    if (!isEmpty(result)) {
      result = result.filter(item => {
        if (!item.completedAt) {
          return item;
        }
        if (!item.assignedRoute) {
          return item;
        }
        return null;
        // end post-pricing service code
      });
    }
    return result || [];
  }

  async batchUpdate(
    { condition: { status }, data, businessUnitId, ids = [], excludeIds = [], log },
    trx = this.knex,
  ) {
    // pre-pricing service code:
    // const subscriptionTable = SubscriptionRepo.TABLE_NAME;

    // let query = trx(this.tableName)
    //   .withSchema(this.schemaName)
    //   .andWhere({ businessUnitId })
    //   .innerJoin(subscriptionTable, `${this.tableName}.subscriptionId`, `${subscriptionTable}.id`)
    //   .whereNotIn(`${this.tableName}.id`, excludeIds)
    //   .select(`${this.tableName}.id`);

    // if (status === SUBSCRIPTION_ORDER_STATUS.needsApproval) {
    //   query = query.andWhereRaw(`${getNeedsApprovalSelect()}='${status}'`);
    // } else {
    //   query = query.where(`${this.tableName}.status`, status);
    // end pre-pricing service code
    const queryFilters = { businessUnitId, skip: 0, limit: 0, sortBy: 'id', sortOrder: 'ASC' };
    const dataFilter = {};
    if (!isEmpty(ids)) {
      dataFilter.ids = ids;
      // end post-pricing service code
    }
    const query = new URLSearchParams(queryFilters).toString();
    const subOrders = await pricingGetSubscriptionsOrders(this.getCtx(), {
      query: `?${query}`,
      data: dataFilter,
    });

    let result;
    // pre-pricing service code:

    // if (subOrders?.length) {
    //   result = await super.updateByIds(
    //     {
    //       ids: subOrders.map(item => item.id),
    //       data,
    //       log,
    //     },
    //     trx,
    //   );
    // end pre-pricing service code
    const idsList = [];
    if (!isEmpty(subOrders)) {
      subOrders.forEach(sub => {
        if (!isEmpty(excludeIds) && excludeIds.includes(sub.id)) {
          return null;
        }
        return idsList.push(sub.id);
      });
      // end post-pricing service code
    }

    if (!isEmpty(idsList)) {
      result = await pricingAlterStatusByIds(this.getCtx(), {
        data: {
          ids: idsList,
          data: {
            status: data.status,
          },
        },
      });
    }

    return result || [];
  }

  async proceedPurchaseOrder(data, trx) {
    const { oneTimePurchaseOrderNumber, customerId } = data;

    if (oneTimePurchaseOrderNumber && customerId) {
      const { id } = await PurchaseOrderRepo.getInstance(this.ctxState).softUpsert(
        {
          data: {
            customerId,
            poNumber: oneTimePurchaseOrderNumber,
            isOneTime: true,
            active: true,
          },
        },
        trx,
      );

      data.purchaseOrderId = id;
    }
  }

  async getDetailsForRoutePlanner({ orderId, thirdPartyHaulerId }, ctx) {
    const item = await pricingGetSubscriptionOrderDetailsForRoutePlanner(ctx, {
      data: { id: orderId },
    });
    const contact = await ContactsRepo.getInstance(this.ctxState).getBy({
      condition: { id: item.jobSiteContactId },
    });

    item.mainPhoneNumber = contact.phoneNumbers?.find(
      phoneNumber => phoneNumber.type === PHONE_TYPES.main,
    )?.number;

    if (thirdPartyHaulerId) {
      const thirdPartyHauler = await ThirdPartyHaulersRepo.getHistoricalInstance(
        this.ctxState,
      ).getById({
        id: thirdPartyHaulerId,
        fields: ['originalId', 'description'],
      });
      item.thirdPartyHaulerId = thirdPartyHauler.originalId;
      item.thirdPartyHaulerDescription = thirdPartyHauler.description;
    }

    return isEmpty(item) ? null : this.mapFields(item);
  }
}

SubscriptionOrdersRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionOrdersRepository;
