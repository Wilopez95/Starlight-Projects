import compose from 'lodash/fp/compose.js';

import { pricingGetLineItems } from '../services/pricing.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemRepo from './billableLineItem.js';
import MaterialRepo from './material.js';
import GlobalRatesLineItemRepo from './globalRatesLineItem.js';
import CustomRatesGroupLineItemRepo from './customRatesGroupLineItem.js';

const TABLE_NAME = 'line_items';

class LineItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      super.mapJoinedFields,
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async populateLineItemsByOrderIds(orderIds, trx = this.knex) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn(`${this.tableName}.orderId`, orderIds);

    const selects = [`${this.tableName}.*`];

    const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    let joinedTableColumns = await BillableLineItemRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('billableLineItem');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(
      billableLineItemHT,
      `${billableLineItemHT}.id`,
      `${this.tableName}.billableLineItemId`,
    );

    const materialHT = MaterialRepo.getHistoricalTableName();
    joinedTableColumns = await MaterialRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('material');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(materialHT, `${materialHT}.id`, `${this.tableName}.materialId`);

    const globalRatesLineItemHT = GlobalRatesLineItemRepo.getHistoricalTableName();
    joinedTableColumns = await GlobalRatesLineItemRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('globalRatesLineItem');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(
      globalRatesLineItemHT,
      `${globalRatesLineItemHT}.id`,
      `${this.tableName}.globalRatesLineItemsId`,
    );

    const customRatesGroupLineItemHT = CustomRatesGroupLineItemRepo.getHistoricalTableName();
    joinedTableColumns = await CustomRatesGroupLineItemRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('customRatesGroupLineItem');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(
      customRatesGroupLineItemHT,
      `${customRatesGroupLineItemHT}.id`,
      `${this.tableName}.customRatesGroupLineItemsId`,
    );

    const items = await query.select(selects).orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this));
  }

  async getLineItemsData(id) {
    const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    const lineItems = await pricingGetLineItems(this.getCtx(), { data: { orderId: id } });
    if (!lineItems[0]) {
      return { lineItems: {}, billableLineItems: {} };
    }
    const billableLineItems = await this.knex(billableLineItemHT)
      .withSchema(this.schemaName)
      .andWhere(`${billableLineItemHT}.id`, lineItems[0].billableLineItemId);

    return {
      lineItems: lineItems[0] || {},
      billableLineItems: billableLineItems[0] || {},
    };
  }
}

LineItemRepository.TABLE_NAME = TABLE_NAME;

export default LineItemRepository;
