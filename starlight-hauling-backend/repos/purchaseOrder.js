import compose from 'lodash/fp/compose.js';
import isEqual from 'lodash/fp/isEqual.js';

import { camelCaseKeys, mapAddressFields, unambiguousSelect } from '../utils/dbHelpers.js';
import { LEVEL_APPLIED_VALUES } from '../consts/purchaseOrder.js';
import VersionedRepository from './_versioned.js';
import PurchaseOrderBusinessLineRepo from './purchaseOrderBusinessLine.js';
import CustomerRepo from './customer.js';
import CustomerJobsitePurchaseOrderRepo from './customerJobSitePairPurchaseOrder.js';
import OrderRepo from './order.js';
import SubscriptionRepo from './subscription/subscription.js';
import SubscriptionOrderRepo from './subscriptionOrder/subscriptionOrder.js';

const TABLE_NAME = 'purchase_orders';

class PurchaseOrderRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['poNumber', 'customerId'];
    this.excludeKeyOnUpsert = 'createdAt';
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      obj => {
        if (obj.businessLines?.[0] == null) {
          obj.businessLines = [];
        }

        return obj;
      },
      mapAddressFields,
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async getAllPaginated({ condition = {}, skip, limit, fields = ['*'] }, trx = this.knex) {
    const query = this.getCommonQuery({ condition, fields }, trx);

    const result = await query.limit(limit).offset(skip);

    return result;
  }

  async getAll({ condition = {}, whereIn = [], fields = ['*'] }, trx = this.knex) {
    let query = this.getCommonQuery({ condition, fields }, trx);

    if (whereIn?.length) {
      whereIn.forEach(({ key, values }) => {
        query = query.whereIn(key, values);
      });
    }

    const result = await query;

    result?.forEach(item => {
      item.customerJobsitePairs = item.customerJobsitePairs?.map(pair => camelCaseKeys(pair));
    });

    return result;
  }

  async createOne({ data: { businessLineIds, ...data }, fields = ['*'], log } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    let purchaseOrder = {};
    try {
      purchaseOrder = await super.createOne({ data, fields }, _trx);

      const poBusinessLinesData = businessLineIds?.map(businessLineId => ({
        purchaseOrderId: purchaseOrder.id,
        businessLineId,
      }));

      if (poBusinessLinesData?.length >= 1) {
        await PurchaseOrderBusinessLineRepo.getInstance(this.ctxState).insertMany(
          { data: poBusinessLinesData },
          _trx,
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

    log &&
      this.log({
        id: purchaseOrder.id,
        entity: this.tableName,
        action: this.logAction.create,
      });

    return purchaseOrder;
  }

  async updateOne({ data: { businessLineIds, id, ...data }, fields = ['*'], log } = {}) {
    const trx = await this.knex.transaction();

    let purchaseOrder = {};
    try {
      purchaseOrder = await super.updateBy({ condition: { id }, data, fields }, trx);

      const poBusinessLinesData = businessLineIds?.map(businessLineId => ({
        purchaseOrderId: purchaseOrder.id,
        businessLineId,
      }));

      if (poBusinessLinesData?.length >= 1) {
        await PurchaseOrderBusinessLineRepo.getInstance(this.ctxState).upsertMany(
          { data: poBusinessLinesData },
          trx,
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log &&
      this.log({
        id: purchaseOrder.id,
        entity: this.tableName,
        action: this.logAction.modify,
      });

    return purchaseOrder;
  }

  async applyLevelAppliedValue({ id, applicationLevel } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      const purchaseOrder = await super.getById({ id }, _trx);

      let { levelApplied } = purchaseOrder;

      if (!levelApplied.includes(applicationLevel)) {
        levelApplied.push(applicationLevel);

        levelApplied = levelApplied.sort(
          (a, b) => LEVEL_APPLIED_VALUES.indexOf(a) - LEVEL_APPLIED_VALUES.indexOf(b),
        );

        await super.updateBy(
          {
            condition: {
              id,
            },
            data: { levelApplied },
          },
          _trx,
        );
      }

      if (!trx) {
        await _trx.commit();
      }

      return purchaseOrder;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async removeLevelAppliedValue({ id, applicationLevelToRemove } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      const purchaseOrder = await super.getById({ id }, _trx);

      let { levelApplied } = purchaseOrder;

      const initalLevelApplied = [...levelApplied];

      levelApplied = levelApplied.filter(value => value !== applicationLevelToRemove);

      if (!isEqual(levelApplied.sort(), initalLevelApplied.sort())) {
        await super.updateBy(
          {
            condition: {
              id,
            },
            data: { levelApplied },
          },
          _trx,
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
  }

  checkIfShouldRemoveLevelAppliedValue(purchaseOrderId, trx = this.knex) {
    return {
      subscription: async () => {
        if (!purchaseOrderId) {
          return false;
        }

        const getSortedLevelAppliedQuery = trx.raw(
          "(select array_agg(x) from (select unnest(array_remove(level_applied, 'Order')) as x order by x) as _)",
        );
        const selectSubscriptionsQuery = trx(SubscriptionRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .select(`${SubscriptionRepo.TABLE_NAME}.id`)
          .where({ purchaseOrderId });

        const query = trx(this.tableName)
          .withSchema(this.schemaName)
          .update({
            levelApplied: trx.raw("(case when ? is null then '{}'::text[] else ? end)", [
              getSortedLevelAppliedQuery,
              getSortedLevelAppliedQuery,
            ]),
          })
          .where(builder => builder.whereNotExists(selectSubscriptionsQuery))
          .andWhere({
            id: purchaseOrderId,
          });

        await query;
        return true;
      },
      order: async () => {
        if (!purchaseOrderId) {
          return false;
        }

        const selectSortedLevelAppliedQuery = trx.raw(
          "(select array_agg(x) from (select unnest(array_remove(level_applied, 'Order')) as x order by x) as _)",
        );

        const selectOrdersQuery = trx(OrderRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .select(`${OrderRepo.TABLE_NAME}.id`)
          .where({ purchaseOrderId });
        const selectSubsriptionOrdersQuery = trx(SubscriptionOrderRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .select(`${SubscriptionOrderRepo.TABLE_NAME}.id`)
          .where({ purchaseOrderId });

        const query = trx(this.tableName)
          .withSchema(this.schemaName)
          .update({
            levelApplied: trx.raw("(case when ? is null then '{}'::text[] else ? end)", [
              selectSortedLevelAppliedQuery,
              selectSortedLevelAppliedQuery,
            ]),
          })
          .where(builder =>
            builder.whereNotExists(selectOrdersQuery).whereNotExists(selectSubsriptionOrdersQuery),
          )
          .andWhere({
            id: purchaseOrderId,
          });

        await query;
        return true;
      },
    };
  }

  getCommonQuery({ condition: { notExpired, ...condition } = {}, fields = ['*'] } = {}, trx) {
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        ...unambiguousSelect(this.tableName, fields),
        trx.raw('array_agg(??.business_line_id) as ??', [
          PurchaseOrderBusinessLineRepo.TABLE_NAME,
          'businessLineIds',
        ]),
        trx.raw('json_agg(distinct ??.*) as ??', [
          CustomerJobsitePurchaseOrderRepo.TABLE_NAME,
          'customerJobsitePairs',
        ]),
        trx.raw('to_json(??.*)', ['customer']),
      ])
      .leftJoin(
        `${CustomerRepo.TABLE_NAME} as customer`,
        `${this.tableName}.customerId`,
        `customer.id`,
      )
      .leftJoin(
        PurchaseOrderBusinessLineRepo.TABLE_NAME,
        `${PurchaseOrderBusinessLineRepo.TABLE_NAME}.purchaseOrderId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        CustomerJobsitePurchaseOrderRepo.TABLE_NAME,
        `${CustomerJobsitePurchaseOrderRepo.TABLE_NAME}.purchaseOrderId`,
        `${this.tableName}.id`,
      )
      .where(condition)
      .groupBy([`${this.tableName}.id`, 'customer.id']);

    if (notExpired) {
      query.andWhere(builder =>
        builder.where('expirationDate', '>', new Date()).orWhereNull('expirationDate'),
      );
    }

    return query;
  }
}

PurchaseOrderRepository.TABLE_NAME = TABLE_NAME;

export default PurchaseOrderRepository;
