import compose from 'lodash/fp/compose.js';

import { camelCaseKeys } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemRepo from './billableLineItem.js';
import ThresholdRepo from './threshold.js';
import BillableServiceRepo from './billableService.js';
import MaterialRepo from './material.js';
import BillableSurchargeRepo from './billableSurcharge.js';
import GlobalRatesSurchargeRepo from './globalRatesSurcharge.js';
import CustomRatesGroupSurchargeRepo from './customRatesGroupSurcharge.js';
import CustomerRepo from './customer.js';

import OrderRepository from './order.js';

const TABLE_NAME = 'surcharge_item';

class SurchargeItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, [
        'billableLineItem',
        'billableService',
        'threshold',
        'material',
        'globalRatesLineItem',
        'customRatesGroupLineItem',
        'surcharge',
      ]),
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async populateSurchargesByOrderId(orderId, trx = this.knex) {
    const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    const billableServiceHT = BillableServiceRepo.getHistoricalTableName();
    const thresholdHT = ThresholdRepo.getHistoricalTableName();
    const billableSurchargeHT = BillableSurchargeRepo.getHistoricalTableName();
    const materialHT = MaterialRepo.getHistoricalTableName();
    const globalRatesSurchargeHT = GlobalRatesSurchargeRepo.getHistoricalTableName();
    const customRatesGroupSurchargeHT = CustomRatesGroupSurchargeRepo.getHistoricalTableName();

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw('to_json(??.*) as ??', [billableLineItemHT, 'billableLineItem']),
        trx.raw('to_json(??.*) as ??', [billableServiceHT, 'billableService']),
        trx.raw('to_json(??.*) as ??', [thresholdHT, 'threshold']),
        trx.raw('to_json(??.*) as ??', [materialHT, 'material']),
        trx.raw('to_json(??.*) as ??', [billableSurchargeHT, 'surcharge']),
        trx.raw('to_json(??.*) as ??', [globalRatesSurchargeHT, 'globalRatesSurcharge']),
        trx.raw('to_json(??.*) as ??', [customRatesGroupSurchargeHT, 'customRatesGroupSurcharge']),
      ])
      .leftJoin(
        billableLineItemHT,
        `${billableLineItemHT}.id`,
        `${this.tableName}.billableLineItemId`,
      )
      .leftJoin(billableServiceHT, `${billableServiceHT}.id`, `${this.tableName}.billableServiceId`)
      .leftJoin(thresholdHT, `${thresholdHT}.id`, `${this.tableName}.thresholdId`)
      .leftJoin(materialHT, `${materialHT}.id`, `${this.tableName}.materialId`)
      .innerJoin(
        globalRatesSurchargeHT,
        `${globalRatesSurchargeHT}.id`,
        `${this.tableName}.globalRatesSurchargesId`,
      )
      .innerJoin(billableSurchargeHT, `${billableSurchargeHT}.id`, `${this.tableName}.surchargeId`)
      .leftJoin(
        customRatesGroupSurchargeHT,
        `${customRatesGroupSurchargeHT}.id`,
        `${this.tableName}.customRatesGroupSurchargesId`,
      )
      .where({ orderId })
      .groupBy([
        `${this.tableName}.id`,
        `${billableSurchargeHT}.id`,
        `${billableLineItemHT}.id`,
        `${thresholdHT}.id`,
        `${billableServiceHT}.id`,
        `${materialHT}.id`,
        `${globalRatesSurchargeHT}.id`,
        `${customRatesGroupSurchargeHT}.id`,
      ])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getQBSum({ condition: { rangeFrom, rangeTo, integrationBuList, orderStatus } = {} }, trx) {
    const _trx = trx || (await this.knex.transaction());
    try {
      let query = _trx(this.tableName)
        .withSchema(this.schemaName)
        .select([
          _trx.raw('sum(??)', `${this.tableName}.amount`),
          `${this.tableName}.surchargeId`,
          'customerGroupId',
        ])
        .innerJoin(
          OrderRepository.TABLE_NAME,
          `${OrderRepository.TABLE_NAME}.id`,
          `${this.tableName}.orderId`,
        )
        .innerJoin(
          CustomerRepo.getHistoricalTableName(),
          `${CustomerRepo.getHistoricalTableName()}.id`,
          `${OrderRepository.TABLE_NAME}.customerId`,
        )
        .where(`${OrderRepository.TABLE_NAME}.surchargesTotal`, '>', 0)
        .where(`${OrderRepository.TABLE_NAME}.grandTotal`, '>', 0)
        .groupBy([`${this.tableName}.surchargeId`, 'customerGroupId'])
        .orderBy(`${this.tableName}.surchargeId`);

      if (orderStatus) {
        query = query.andWhere(`${OrderRepository.TABLE_NAME}.status`, orderStatus);
      }

      if (rangeFrom) {
        query = query.andWhere(`${OrderRepository.TABLE_NAME}.invoiceDate`, '>', rangeFrom);
      }

      if (rangeTo) {
        query = query.andWhere(`${OrderRepository.TABLE_NAME}.invoiceDate`, '<=', rangeTo);
      }

      if (integrationBuList?.length) {
        query = query.whereIn(`${OrderRepository.TABLE_NAME}.businessUnitId`, integrationBuList);
      }

      const result = await query;
      if (!trx) {
        await _trx.commit();
      }
      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }
}

SurchargeItemRepository.TABLE_NAME = TABLE_NAME;

export default SurchargeItemRepository;
