import isEmpty from 'lodash/isEmpty.js';

import { camelCaseKeys } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemRepo from './billableLineItem.js';
import SubscriptionOrderLineItemRepo from './subscriptionOrderLineItem.js';
import GlobalRatesLineItemRepo from './globalRatesLineItem.js';
import CustomRatesGroupLineItemRepo from './customRatesGroupLineItem.js';
import MaterialRepo from './material.js';

const TABLE_NAME = 'subscription_work_orders_line_items';

class SubscriptionWorkOrderLineItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['id'];
  }

  async getUrlsBySubscriptionWorkOrderId(
    { subscriptionWorkOrderId, fields = ['*'] },
    trx = this.knex,
  ) {
    const images = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ subscriptionWorkOrderId })
      .select(fields);

    return images;
  }

  // ToDo: Modify this endpoint to take information from the pricing backend
  // By: Esteban Navarro || Ticket: PS-230
  async getAllGroupedByWorkOrder(subscriptionWorkOrdersIds, trx = this.knex) {
    const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    const GlobalRatesLineItemHT = GlobalRatesLineItemRepo.getHistoricalTableName();
    const CustomRatesGroupLineItemHT = CustomRatesGroupLineItemRepo.getHistoricalTableName();
    const MaterialHT = MaterialRepo.getHistoricalTableName();
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(
        billableLineItemHT,
        `${billableLineItemHT}.id`,
        `${this.tableName}.billableLineItemId`,
      )
      .innerJoin(
        GlobalRatesLineItemHT,
        `${GlobalRatesLineItemHT}.id`,
        `${this.tableName}.globalRatesLineItemsId`,
      )
      .leftJoin(
        CustomRatesGroupLineItemHT,
        `${CustomRatesGroupLineItemHT}.id`,
        `${this.tableName}.customRatesGroupLineItemsId`,
      )
      .leftJoin(MaterialHT, `${MaterialHT}.id`, `${this.tableName}.materialId`)
      .whereIn('subscriptionWorkOrderId', subscriptionWorkOrdersIds)
      .select([
        trx.raw(
          `json_agg(
                        json_build_object(
                            'id', ${this.tableName}.id,
                            'subscriptionWorkOrderId', ${this.tableName}.subscription_work_order_id,
                            'billableLineItemId', ${this.tableName}.billable_line_item_id,
                            'globalRatesLineItemsId', ${GlobalRatesLineItemHT}.original_id,
                            'materialId', ${MaterialHT}.original_id,
                            'customRatesGroupLineItemsId',
                                ${CustomRatesGroupLineItemHT}.original_id,
                            'price', ${this.tableName}.price,
                            'quantity', ${this.tableName}.quantity,
                            'createdAt', ${this.tableName}.created_at,
                            'updatedAt', ${this.tableName}.updated_at,
                            'historicalLineItem', json_build_object(
                                'id', ${billableLineItemHT}.id,
                                'originalId', ${billableLineItemHT}.original_id,
                                'oneTime', ${billableLineItemHT}.one_time,
                                'description', ${billableLineItemHT}.description,
                                'type', ${billableLineItemHT}.type,
                                'unit', ${billableLineItemHT}.unit
                            )
                        )
                    ) as lineItems`,
        ),
        'subscriptionWorkOrderId',
      ])
      .groupBy('subscriptionWorkOrderId');

    const items = await query;

    if (!items) {
      return [];
    }

    // https://github.com/Starlightpro/starlight-hauling-backend/pull/996#discussion_r558349812
    return items.map(item => ({ ...item, lineItems: item.lineitems }));
  }

  async upsertMany({ data: dataArr = [], subscriptionOrderId, subscriptionWorkOrderId }, trx) {
    const subscriptionOrderLineItemRepo = SubscriptionOrderLineItemRepo.getInstance(this.ctxState);
    const ids = dataArr.filter(item => item.id).map(item => item.id);
    await super.deleteBy(
      {
        condition: { subscriptionWorkOrderId },
        whereNotIn: [
          {
            key: 'id',
            values: ids,
          },
        ],
      },
      trx,
    );

    let upsertItems;

    if (!isEmpty(dataArr)) {
      const lineItems = await subscriptionOrderLineItemRepo.prepHistoricalAndComputedFields({
        dataArr,
        subscriptionWorkOrderId,
      });

      upsertItems = await super.upsertMany(
        {
          data: lineItems,
        },
        trx,
      );
    }

    await subscriptionOrderLineItemRepo.upsertMany(
      {
        data: upsertItems?.map(camelCaseKeys),
        subscriptionOrderId,
        subscriptionWorkOrderId,
      },
      trx,
    );
  }

  // TODO make historical record on delete
  deleteByIds(ids, trx = this.knex) {
    return trx(this.tableName).withSchema(this.schemaName).whereIn('id', ids).delete();
  }
}

SubscriptionWorkOrderLineItemRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionWorkOrderLineItemRepository;
