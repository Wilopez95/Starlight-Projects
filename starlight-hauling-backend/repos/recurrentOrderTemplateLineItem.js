import compose from 'lodash/fp/compose.js';

import { camelCaseKeys } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemRepo from './billableLineItem.js';
import MaterialRepo from './material.js';
import GlobalRatesLineItemRepo from './globalRatesLineItem.js';
import CustomRatesGroupLineItemRepo from './customRatesGroupLineItem.js';

const TABLE_NAME = 'recurrent_order_template_line_items';

class RecurrentOrderTemplateLineItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        ['billableLineItem', 'material', 'globalRatesLineItem', 'customRatesGroupLineItem'].forEach(
          field => {
            if (obj[field]) {
              obj[field] = camelCaseKeys(obj[field]);
            } else {
              delete obj[field];
            }
          },
        );
        return obj;
      },
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async populateLineItemsByOrderId(recurrentOrderTemplateId, trx = this.knex) {
    const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    const materialHT = MaterialRepo.getHistoricalTableName();
    const globalRatesLineItemHT = GlobalRatesLineItemRepo.getHistoricalTableName();
    const customRatesGroupLineItemHT = CustomRatesGroupLineItemRepo.getHistoricalTableName();

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw('to_json(??.*) as ??', [billableLineItemHT, 'billableLineItem']),
        trx.raw('to_json(??.*) as ??', [materialHT, 'material']),
        trx.raw('to_json(??.*) as ??', [globalRatesLineItemHT, 'globalRatesLineItem']),
        trx.raw('to_json(??.*) as ??', [customRatesGroupLineItemHT, 'customRatesGroupLineItem']),
      ])
      .innerJoin(
        billableLineItemHT,
        `${billableLineItemHT}.id`,
        `${this.tableName}.billableLineItemId`,
      )
      .leftJoin(materialHT, `${materialHT}.id`, `${this.tableName}.materialId`)
      .innerJoin(
        globalRatesLineItemHT,
        `${globalRatesLineItemHT}.id`,
        `${this.tableName}.globalRatesLineItemsId`,
      )
      .leftJoin(
        customRatesGroupLineItemHT,
        `${customRatesGroupLineItemHT}.id`,
        `${this.tableName}.customRatesGroupLineItemsId`,
      )
      .where({ recurrentOrderTemplateId })
      .groupBy([
        `${this.tableName}.id`,
        `${billableLineItemHT}.id`,
        `${materialHT}.id`,
        `${globalRatesLineItemHT}.id`,
        `${customRatesGroupLineItemHT}.id`,
      ])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? undefined;
  }
}

RecurrentOrderTemplateLineItemRepository.TABLE_NAME = TABLE_NAME;

export default RecurrentOrderTemplateLineItemRepository;
