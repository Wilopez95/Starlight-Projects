import isEmpty from 'lodash/isEmpty.js';
import compose from 'lodash/fp/compose.js';

import { camelCaseKeys } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemRepo from './billableLineItem.js';
import BillableServiceRepo from './billableService.js';
import MaterialRepo from './material.js';
import BillableSurchargeRepo from './billableSurcharge.js';
import GlobalRatesSurchargeRepo from './globalRatesSurcharge.js';
import CustomRatesGroupSurchargeRepo from './customRatesGroupSurcharge.js';

const TABLE_NAME = 'subscription_surcharge_item';

class SubscriptionSurchargeItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['id'];
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

  async populateBy({ condition }, trx = this.knex) {
    const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    const billableServiceHT = BillableServiceRepo.getHistoricalTableName();

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
      .where(condition)
      .groupBy([
        `${this.tableName}.id`,
        `${billableSurchargeHT}.id`,
        `${billableLineItemHT}.id`,
        `${billableServiceHT}.id`,
        `${materialHT}.id`,
        `${globalRatesSurchargeHT}.id`,
        `${customRatesGroupSurchargeHT}.id`,
      ])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async upsertManyBy({ data: dataArr, condition }, trx = this.knex) {
    const ids = dataArr.filter(item => item.id).map(item => item.id);
    await super.deleteBy(
      {
        condition,
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
      upsertItems = await super.upsertMany(
        {
          data: dataArr,
        },
        trx,
      );
    }

    return upsertItems;
  }
}

SubscriptionSurchargeItemRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionSurchargeItemRepository;
