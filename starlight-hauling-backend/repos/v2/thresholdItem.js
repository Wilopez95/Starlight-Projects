import compose from 'lodash/fp/compose.js';

import VersionedRepository from '../_versioned.js';
import ThresholdRepo from '../threshold.js';
import PriceRepo from '../prices.js';

// TODO: get rid of them
import GlobalRatesThresholdRepo from '../globalRatesThreshold.js';
import CustomRatesGroupThresholdRepo from '../customRatesGroupThreshold.js';

import { unambiguousCondition, unambiguousField } from '../../utils/dbHelpers.js';

const TABLE_NAME = 'threshold_items';

class ThresholdItemRepository extends VersionedRepository {
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

  async populateThresholdItemsByOrderIds(orderIds, trx = this.knex) {
    const items = await this.populateThresholdItemsBy(
      {},
      [{ key: 'orderId', values: orderIds }],
      trx,
    );
    return items;
  }

  async populateThresholdItemsBy(condition = {}, whereIn = [], trx = this.knex) {
    let query = trx(this.tableName).withSchema(this.schemaName);

    const selects = [`${this.tableName}.*`];

    const thresholdHT = ThresholdRepo.getHistoricalTableName();
    let joinedTableColumns = await ThresholdRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('threshold');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(thresholdHT, `${thresholdHT}.id`, `${this.tableName}.thresholdId`);

    const pricesRepo = PriceRepo.getInstance(this.ctxState, {
      schemaName: this.schemaName,
    });
    const pricesTable = pricesRepo.tableName;
    joinedTableColumns = await pricesRepo.getColumnsToSelect('priceItem');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(pricesTable, `${pricesTable}.id`, `${this.tableName}.refactoredPriceId`);

    // TODO: remove old prices after data clean-up
    const globalRatesThresholdHT = GlobalRatesThresholdRepo.getHistoricalTableName();
    joinedTableColumns = await GlobalRatesThresholdRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('globalRatesThreshold');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(
      globalRatesThresholdHT,
      `${globalRatesThresholdHT}.id`,
      `${this.tableName}.globalRatesThresholdsId`,
    );

    const customRatesGroupThresholdHT = CustomRatesGroupThresholdRepo.getHistoricalTableName();
    joinedTableColumns = await CustomRatesGroupThresholdRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('customRatesGroupThreshold');

    selects.push(...joinedTableColumns);
    query = query.leftJoin(
      customRatesGroupThresholdHT,
      `${customRatesGroupThresholdHT}.id`,
      `${this.tableName}.customRatesGroupThresholdsId`,
    );

    query = query.where(unambiguousCondition(this.tableName, condition));

    if (whereIn?.length) {
      whereIn.forEach(({ key, values }) => {
        query = query.whereIn(unambiguousField(this.tableName, key), values);
      });
    }

    // this.ctxState.logger.debug(`thresholdItemRepo->populateThresholdItemsBy->query: ${query.toString()}`);
    const items = await query.select(selects).orderBy(`${this.tableName}.id`);
    // this.ctxState.logger.debug(`thresholdItemRepo->populateThresholdItemsBy->items: ${JSON.stringify(items, null, 2)}`);

    return items?.map(this.mapFields.bind(this));
  }
}

ThresholdItemRepository.TABLE_NAME = TABLE_NAME;

export default ThresholdItemRepository;
