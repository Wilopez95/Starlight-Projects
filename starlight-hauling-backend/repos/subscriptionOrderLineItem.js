import isEmpty from 'lodash/isEmpty.js';
import fpPick from 'lodash/fp/pick.js';

import { unambiguousSelect } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemRepo from './billableLineItem.js';
import GlobalRatesLineItemRepo from './globalRatesLineItem.js';
import CustomRatesGroupLineItemRepo from './customRatesGroupLineItem.js';
import MaterialRepo from './material.js';

const TABLE_NAME = 'subscription_orders_line_items';

class SubscriptionOrderLineItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['id'];
  }

  async getAllBySubscriptionOrderId({ subscriptionOrderId, fields = ['*'] }, trx = this.knex) {
    const images = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ subscriptionOrderId })
      .select(fields);

    return images;
  }

  // ToDo: Modify this endpoint to take information from the pricing backend
  // By: Esteban Navarro || Ticket: PS-230
  async getAllGroupedByOrder(subscriptionOrdersIds, trx = this.knex) {
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
      .whereIn('subscriptionOrderId', subscriptionOrdersIds)
      .select([
        trx.raw(
          `json_agg(
                        json_build_object(
                            'id', ${this.tableName}.id,
                            'subscriptionOrderId', ${this.tableName}.subscription_order_id,
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
        'subscriptionOrderId',
      ])
      .groupBy(`${this.tableName}.subscriptionOrderId`);

    const items = await query;
    if (!items) {
      return [];
    }
    // https://github.com/Starlightpro/starlight-hauling-backend/pull/996#discussion_r558349812
    return items.map(item => ({ ...item, lineItems: item.lineitems }));
  }

  async insertMany({ data: dataArr }, trx) {
    const lineItems = await this.prepHistoricalAndComputedFields({ dataArr });

    await super.insertMany(
      {
        data: lineItems,
      },
      trx,
    );
  }

  async upsertMany({ data: dataArr = [], subscriptionOrderId, subscriptionWorkOrderId }, trx) {
    const condition = {
      subscriptionOrderId,
    };

    const ids = dataArr.filter(item => item.id).map(item => item.id);

    let upsertData = dataArr;

    let key = 'id';
    if (subscriptionWorkOrderId) {
      key = 'workOrderLineItemId';
      condition.subscriptionWorkOrderId = subscriptionWorkOrderId;
      upsertData = await this.mapByWorkOrderLineItemId({ dataArr }, trx);
    }
    await super.deleteBy(
      {
        condition,
        whereNotIn: [
          {
            key,
            values: ids,
          },
        ],
      },
      trx,
    );

    const lineItems = await this.prepHistoricalAndComputedFields({
      dataArr: upsertData,
      subscriptionOrderId,
      subscriptionWorkOrderId,
    });

    if (!isEmpty(lineItems)) {
      await super.upsertMany(
        {
          data: lineItems,
        },
        trx,
      );
    }
  }

  prepHistoricalAndComputedFields({ dataArr, subscriptionOrderId, subscriptionWorkOrderId }) {
    return Promise.all(
      dataArr.map(async item => {
        if (subscriptionOrderId) {
          item.subscriptionOrderId = subscriptionOrderId;
        }
        if (subscriptionWorkOrderId) {
          item.subscriptionWorkOrderId = subscriptionWorkOrderId;
        }

        // when already historical data
        if (subscriptionOrderId && subscriptionWorkOrderId) {
          return item;
        }

        const linkedItem = await super.getLinkedHistoricalIds(
          fpPick([
            'billableLineItemId',
            'globalRatesLineItemsId',
            'customRatesGroupLineItemsId',
            'materialId',
          ])(item),
          {
            entityId: item?.id,
            entityRepo: this,
          },
        );

        return { ...item, ...linkedItem };
      }, this),
    );
  }

  mapByWorkOrderLineItemId({ dataArr }, trx) {
    return Promise.all(
      dataArr.map(async item => {
        let lineItem;
        if (item.id) {
          lineItem = await super.getBy(
            {
              condition: {
                workOrderLineItemId: item.id,
              },
            },
            trx,
          );
        }

        item.workOrderLineItemId = item.id;
        delete item.id;
        if (lineItem?.id) {
          item.id = lineItem?.id;
        }
        return item;
      }),
    );
  }

  deleteByIds(ids, trx = this.knex) {
    return trx(this.tableName).withSchema(this.schemaName).whereIn('id', ids).delete();
  }

  async getItemBySpecificDate({ lineItemId, fields = ['*'], withOriginalIds = false }) {
    this.ctxState.logger.debug(
      `subscriptionOrderLineItemRepo->getItemBySpecificDate->lineItemId: ${lineItemId}`,
    );

    const selects = [...unambiguousSelect(this.historicalTableName, fields)];
    let query = this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .where(`${this.historicalTableName}.originalId`, lineItemId)
      .orderByRaw(`${this.historicalTableName}.created_at::timestamp desc`);

    if (withOriginalIds) {
      // TODO: join and select necessary original IDs of related entities
    }

    query = query.first(selects);

    const result = await query;

    this.ctxState.logger.debug(
      result,
      'subscriptionOrderLineItemRepo->getItemBySpecificDate->result',
    );

    return result;
  }
}

SubscriptionOrderLineItemRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionOrderLineItemRepository;
