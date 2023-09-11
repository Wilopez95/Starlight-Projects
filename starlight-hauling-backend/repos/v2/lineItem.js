import compose from 'lodash/fp/compose.js';

import VersionedRepository from '../_versioned.js';
import BillableLineItemRepo from '../billableLineItem.js';
import MaterialRepo from '../material.js';
import PriceRepo from '../prices.js';

// TODO: get rid of them
import GlobalRatesLineItemRepo from '../globalRatesLineItem.js';
import CustomRatesGroupLineItemRepo from '../customRatesGroupLineItem.js';

import { replaceLegacyWithRefactoredFieldsDeep } from '../../utils/priceRefactoring.js';
import { unambiguousCondition, unambiguousField } from '../../utils/dbHelpers.js';

const TABLE_NAME = 'line_items';

class LineItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, ['billableLineItem', 'material', 'priceItem']),
      super.mapJoinedFields,
      super.camelCaseKeys,
      super.mapFields,
      replaceLegacyWithRefactoredFieldsDeep,
    )(originalObj);
  }

  async populateLineItemsByOrderIds(orderIds, trx = this.knex) {
    const items = await this.populateLineItemsBy({}, [{ key: 'orderId', values: orderIds }], trx);
    return items;
  }

  async populateLineItemsBy(condition = {}, whereIn = [], trx = this.knex) {
    let query = trx(this.tableName).withSchema(this.schemaName);

    const selects = [`${this.tableName}.*`];

    const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
    let joinedTableColumns = await BillableLineItemRepo.getHistoricalInstance(
      this.ctxState,
    ).getColumnsToSelect('billableLineItem');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(
      billableLineItemHT,
      `${billableLineItemHT}.id`,
      `${this.tableName}.billableLineItemId`,
    );

    const materialHT = MaterialRepo.getHistoricalTableName();
    joinedTableColumns = await MaterialRepo.getHistoricalInstance(this.ctxState).getColumnsToSelect(
      'material',
    );

    selects.push(...joinedTableColumns);
    query = query.leftJoin(materialHT, `${materialHT}.id`, `${this.tableName}.materialId`);

    const pricesRepo = PriceRepo.getInstance(this.ctxState);
    const pricesTable = pricesRepo.tableName;
    joinedTableColumns = await pricesRepo.getColumnsToSelect('priceItem');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(pricesTable, `${pricesTable}.id`, `${this.tableName}.refactoredPriceId`);

    // TODO: remove old prices after data clean-up
    const globalRatesLineItemHT = GlobalRatesLineItemRepo.getHistoricalTableName();
    joinedTableColumns = await GlobalRatesLineItemRepo.getHistoricalInstance(
      this.ctxState,
    ).getColumnsToSelect('globalRatesLineItem');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(
      globalRatesLineItemHT,
      `${globalRatesLineItemHT}.id`,
      `${this.tableName}.globalRatesLineItemsId`,
    );

    const customRatesGroupLineItemHT = CustomRatesGroupLineItemRepo.getHistoricalTableName();
    joinedTableColumns = await CustomRatesGroupLineItemRepo.getHistoricalInstance(
      this.ctxState,
    ).getColumnsToSelect('customRatesGroupLineItem');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(
      customRatesGroupLineItemHT,
      `${customRatesGroupLineItemHT}.id`,
      `${this.tableName}.customRatesGroupLineItemsId`,
    );

    query = query.where(unambiguousCondition(this.tableName, condition));

    if (whereIn?.length) {
      whereIn.forEach(({ key, values }) => {
        query = query.whereIn(unambiguousField(this.tableName, key), values);
      });
    }
    query = query.select(selects).orderBy(`${this.tableName}.id`);

    // this.ctxState.logger.debug(`lineItemRepo->populateLineItemsBy->query: ${query.toString()}`);
    const items = await query;
    // this.ctxState.logger.debug(`lineItemRepo->populateLineItemsBy->items: ${JSON.stringify(items, null, 2)}`);

    return items?.map(this.mapFields.bind(this));
  }
}

LineItemRepository.TABLE_NAME = TABLE_NAME;

export default LineItemRepository;
