import compose from 'lodash/fp/compose.js';

import { updateBasedOnSnapshot as updateLineItem } from '../services/subscriptionRecurringLineItems/updateBasedOnSnapshot.js';
// pre-pricing service refactor code:
// import { camelCaseKeys, unambiguousSelect } from '../utils/dbHelpers.js';
import { camelCaseKeys } from '../utils/dbHelpers.js';
import {
  subscriptionLineItemsBySpecificDate,
  subscriptionNextLineItemsBySpecificDate,
} from '../services/pricing.js';
import VersionedRepository from './_versioned.js';
import SubscriptionRepo from './subscription/subscription.js';
import SubscriptionServiceItemRepo from './subscriptionServiceItem/subscriptionServiceItem.js';
import RecurringLineItemsGlobalRatesRepo from './globalRateRecurringLineItemBillingCycle.js';
import RecurringLineItemsCustomRatesRepo from './customRatesGroupRecurringLineItemBillingCycle.js';
import CustomRatesGroupLineItemRepo from './customRatesGroupLineItem.js';
import BillableLineItemRepo from './billableLineItem.js';

const TABLE_NAME = 'subscription_line_item';

class SubscriptionLineItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  getCtx() {
    return {
      state: this.ctxState,
      logger: this.ctxState.logger,
    };
  }

  mapFields(originalObj) {
    return compose(camelCaseKeys, super.mapFields)(originalObj);
  }

  async getByRate(
    {
      billableLineItemBillingCycleId,
      globalRatesRecurringLineItemId,
      customRatesGroupRecurringLineItemId,
    },
    trx = this.knex,
  ) {
    const recurringLineItemsGlobalRatesHT =
      RecurringLineItemsGlobalRatesRepo.getHistoricalTableName();
    const recurringLineItemsCustomRatesHT =
      RecurringLineItemsCustomRatesRepo.getHistoricalTableName();

    const selects = [
      `${this.tableName}.*`,
      `${SubscriptionRepo.TABLE_NAME}.id as subscriptionId`,
      `${SubscriptionRepo.TABLE_NAME}.nextBillingPeriodFrom`,
      trx.raw('to_json(??.*) as ??', [SubscriptionRepo.TABLE_NAME, 'subscription']),
    ];
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(
        SubscriptionServiceItemRepo.TABLE_NAME,
        `${SubscriptionServiceItemRepo.TABLE_NAME}.id`,
        `${this.tableName}.subscription_service_item_id`,
      )
      .innerJoin(
        SubscriptionRepo.TABLE_NAME,
        `${SubscriptionRepo.TABLE_NAME}.id`,
        `${SubscriptionServiceItemRepo.TABLE_NAME}.subscriptionId`,
      )
      .where(`${SubscriptionRepo.TABLE_NAME}.unlockOverrides`, false);

    if (globalRatesRecurringLineItemId) {
      query = query
        .innerJoin(
          recurringLineItemsGlobalRatesHT,
          `${recurringLineItemsGlobalRatesHT}.id`,
          `${this.tableName}.global_rates_recurring_line_items_billing_cycle_id`,
        )
        .where(
          `${recurringLineItemsGlobalRatesHT}.billableLineItemBillingCycleId`,
          billableLineItemBillingCycleId,
        )
        .where(
          `${recurringLineItemsGlobalRatesHT}.globalRatesRecurringLineItemId`,
          globalRatesRecurringLineItemId,
        );
    }

    if (customRatesGroupRecurringLineItemId) {
      query = query
        .innerJoin(
          recurringLineItemsCustomRatesHT,
          `${recurringLineItemsCustomRatesHT}.id`,
          `${this.tableName}.custom_rates_group_recurring_line_item_billing_cycle_id`,
        )
        .where(
          `${recurringLineItemsCustomRatesHT}.billableLineItemBillingCycleId`,
          billableLineItemBillingCycleId,
        )
        .where(
          `${recurringLineItemsCustomRatesHT}.customRatesGroupRecurringLineItemId`,
          globalRatesRecurringLineItemId,
        );
    }

    const items = await query;
    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async updateLineItemsByRateChanges(
    {
      billableLineItemBillingCycleId,
      globalRatesRecurringLineItemId,
      customRatesGroupRecurringLineItemId,
      impactedSubscriptionIdsSet,
      price,
    },
    trx = this.knex,
  ) {
    const lineItems = await this.getByRate(
      {
        billableLineItemBillingCycleId,
        globalRatesRecurringLineItemId,
        customRatesGroupRecurringLineItemId,
      },
      trx,
    );

    if (lineItems?.length) {
      const updatePromises = lineItems.map(
        ({ id, subscriptionId, nextBillingPeriodFrom, subscription }) => {
          if (impactedSubscriptionIdsSet) {
            impactedSubscriptionIdsSet.add(subscriptionId);
          }

          return updateLineItem(
            this.getCtx(),
            {
              // TODO: link with new historical globalRatesRecurringLineItem record
              // TODO: link with new historical customRatesGroupRecurringLineItem record
              subscription: {
                businessUnitId: subscription.businessUnitId,
                businessLineId: subscription.businessLineId,
                billingCycle: subscription.billingCycle,
              },
              id,
              price,
              effectiveDate: nextBillingPeriodFrom,
            },
            trx,
          );
        },
      );

      await Promise.all(updatePromises);
    }
  }
  // pre-pricing service refactor code:
  // async getItemBySpecificDate({
  //   lineItemId,
  //   specifiedDate,
  //   fields = ['*'],
  //   withOriginalIds = false,
  // }) {
  //   const serviceItemT = SubscriptionServiceItemRepo.TABLE_NAME;
  //   const subscriptionT = SubscriptionRepo.TABLE_NAME;

  //   const selects = [
  //     ...unambiguousSelect(this.historicalTableName, fields),
  //     this.knex.raw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp as effective_date`,
  //     ),
  //     `${subscriptionT}.billingCycle`,
  //   ];
  //   let query = this.knex(this.historicalTableName)
  //     .withSchema(this.schemaName)
  //     .innerJoin(
  //       serviceItemT,
  //       `${serviceItemT}.id`,
  //       `${this.historicalTableName}.subscriptionServiceItemId`,
  //     )
  //     .innerJoin(subscriptionT, `${subscriptionT}.id`, `${serviceItemT}.subscriptionId`)
  //     .where(`${this.historicalTableName}.originalId`, lineItemId)
  //     .andWhereRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp <= ?`,
  //       [specifiedDate],
  //     )
  //     .orderByRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp desc`,
  //     );
  //   if (withOriginalIds) {
  //     const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
  //     const recurringLineItemsCustomRatesHT =
  //       RecurringLineItemsCustomRatesRepo.getHistoricalTableName();
  //     const lineItemCustomRatesGroupT = CustomRatesGroupLineItemRepo.TABLE_NAME;

  //     query = query
  //       .innerJoin(
  //         billableLineItemHT,
  //         `${billableLineItemHT}.id`,
  //         `${this.historicalTableName}.billableLineItemId`,
  //       )
  //       .leftJoin(
  //         recurringLineItemsCustomRatesHT,
  //         `${recurringLineItemsCustomRatesHT}.id`,
  //         `${this.historicalTableName}.customRatesGroupRecurringLineItemBillingCycleId`,
  //       )
  //       .leftJoin(
  //         lineItemCustomRatesGroupT,
  //         `${lineItemCustomRatesGroupT}.id`,
  //         `${recurringLineItemsCustomRatesHT}.customRatesGroupRecurringLineItemId`,
  //       );
  //     selects.push(
  //       `${lineItemCustomRatesGroupT}.customRatesGroupId as customRatesGroupOriginalId`,
  //       `${billableLineItemHT}.originalId as billableLineItemOriginalId`,
  //     );
  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done
  async getItemBySpecificDate({ lineItemId, specifiedDate, withOriginalIds = false }) {
    // const serviceItemT = SubscriptionServiceItemRepo.TABLE_NAME;
    // const subscriptionT = SubscriptionRepo.TABLE_NAME;

    // const selects = [
    //   ...unambiguousSelect(this.historicalTableName, fields),
    //   this.knex.raw(
    //     `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp as effective_date`,
    //   ),
    //   `${subscriptionT}.billingCycle`,
    // ];
    // let query = this.knex(this.historicalTableName).withSchema(this.schemaName);
    // .innerJoin(serviceItemT, `${serviceItemT}.id`, `${this.historicalTableName}.subscriptionServiceItemId`)
    // .innerJoin(subscriptionT, `${subscriptionT}.id`, `${serviceItemT}.subscriptionId`)
    // .where(`${this.historicalTableName}.originalId`, lineItemId)
    // .andWhereRaw(`coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp <= ?`, [
    //   specifiedDate,
    // ])
    // .orderByRaw(`coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp desc`);
    const subsLineItems = await subscriptionLineItemsBySpecificDate(this.getCtx(), {
      data: { lineItemId, specifiedDate },
    });
    if (withOriginalIds) {
      const billableLineItemHT = BillableLineItemRepo.getHistoricalInstance(this.getCtx(), {
        schemaName: this.ctxState.user.schemaName,
        tableName: BillableLineItemRepo.getHistoricalTableName(),
      });
      const recurringLineItemsCustomRatesHT =
        RecurringLineItemsCustomRatesRepo.getHistoricalInstance(this.getCtx(), {
          schemaName: this.ctxState.user.schemaName,
          tableName: RecurringLineItemsCustomRatesRepo.getHistoricalTableName(),
        });
      const lineItemCustomRatesGroupT = CustomRatesGroupLineItemRepo.getInstance(this.getCtx(), {
        schemaName: this.ctxState.user.schemaName,
        tableName: CustomRatesGroupLineItemRepo.getHistoricalTableName(),
      });

      const billableLineItem = await billableLineItemHT.getBy({
        condition: { id: subsLineItems.billableLineItemId },
      });
      const recurringLineItemsCustomRates = await recurringLineItemsCustomRatesHT.getBy({
        condition: { id: subsLineItems.customRatesGroupRecurringLineItemBillingCycleId },
      });
      const lineItemCustomRatesGroup = await lineItemCustomRatesGroupT.getBy({
        condition: { id: recurringLineItemsCustomRates.customRatesGroupRecurringLineItemId },
      });

      subsLineItems.customRatesGroupOriginalId = lineItemCustomRatesGroup.customRatesGroupId;
      subsLineItems.billableLineItemOriginalId = billableLineItem.originalId;
    }

    const result = subsLineItems;

    this.ctxState.logger.debug(result, 'subsLineItemRepo->getItemBySpecificDate->result');
    return result;
  }

  // pre-pricing service refactor code:
  // async getNextItemBySpecificDate({ lineItemId, specifiedDate, fields = ['*'] }) {
  //   const result = await this.knex(this.historicalTableName)
  //     .withSchema(this.schemaName)
  //     .first([
  //       ...unambiguousSelect(this.historicalTableName, fields),
  //       this.knex.raw(
  //         `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp as effective_date`,
  //       ),
  //     ])
  //     .where(`${this.historicalTableName}.originalId`, lineItemId)
  //     .andWhereRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp > ?`,
  //       [specifiedDate],
  //     )
  //     .orderByRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp asc`,
  //     );
  // ToDo: Updated the subscriptions Line Items
  // By: Wilson Lopez | Ticket: PS-227 | Date: 29/11/2022
  // async updateByIds({ ids, insertData }, trx = this.knex) {
  //   if (!ids.length) {
  //     return [];
  //   }
  // let subscriptionLineItem = [];
  // for (const id of ids) {
  //   const subOrder = await pricingUpdateSubscriptionOrderBySubId(
  //     this.getCtx(),
  //     { data: insertData },
  //     id,
  //   );
  //   subscriptionOrders.push(subOrder);
  // }

  //   return subscriptionLineItem;
  // }

  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  async getNextItemBySpecificDate({ lineItemId, specifiedDate }) {
    const subsLineItems = await subscriptionNextLineItemsBySpecificDate(this.getCtx(), {
      data: { lineItemId, specifiedDate },
    });
    const result = subsLineItems;
    this.ctxState.logger.debug(result, 'subsLineItemRepo->getNextItemBySpecificDate->result');
    return result;
  }
}

SubscriptionLineItemRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionLineItemRepository;
