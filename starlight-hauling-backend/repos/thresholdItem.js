import compose from 'lodash/fp/compose.js';

import { calculeteWeigthFromKilograms } from '../utils/convertUnits.js';
import { pricingGetThreshold } from '../services/pricing.js';
import VersionedRepository from './_versioned.js';
import ThresholdRepo from './threshold.js';
import GlobalRatesThresholdRepo from './globalRatesThreshold.js';
import CustomRatesGroupThresholdRepo from './customRatesGroupThreshold.js';

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
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn(`${this.tableName}.orderId`, orderIds);

    const selects = [`${this.tableName}.*`];

    const thresholdHT = ThresholdRepo.getHistoricalTableName();
    let joinedTableColumns = await ThresholdRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('threshold');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(thresholdHT, `${thresholdHT}.id`, `${this.tableName}.thresholdId`);

    const globalRatesThresholdHT = GlobalRatesThresholdRepo.getHistoricalTableName();
    joinedTableColumns = await GlobalRatesThresholdRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('globalRatesThreshold');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(
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

    const items = await query.select(selects).orderBy(`${this.tableName}.id`);

    const itemsRefactor = items?.map(threshold => {
      // pre-pricing service code ???!
      const quantity = calculeteWeigthFromKilograms(
        threshold.quantity,
        threshold.zzzthresholddottype,
        threshold.zzzthresholddotunit || '',
      );
      return { ...threshold, quantity };
    });
    return itemsRefactor?.map(this.mapFields.bind(this));
  }

  static async getGlobalRateThresholdIdByOrderId(
    { schemaName, condition, fields = ['global_rates_thresholds_id'] },
    trx = this.knex,
  ) {
    const item = await trx(TABLE_NAME)
      .withSchema(schemaName)
      .select(fields)
      .where(condition)
      .orderBy('id', 'desc')
      .first();

    return item;
  }

  async getThresholdItemData(id) {
    const thresholdHT = ThresholdRepo.getHistoricalTableName();
    const defaultValue = { thresholdItems: {}, thresholds: {} };
    try {
      // pricing service code
      const thresholdItems = await pricingGetThreshold(this.getCtx(), { data: { orderId: id } });
      if (!thresholdItems[0]) {
        return defaultValue;
      }
      const thresholds = await this.knex(thresholdHT)
        .withSchema(this.schemaName)
        .andWhere(`${thresholdHT}.originalId`, thresholdItems[0].thresholdId)
        .first();
      return {
        thresholdItems: thresholdItems[0] || {},
        thresholds: thresholds || {},
      };
    } catch (e) {
      return defaultValue;
    }
  }
}

ThresholdItemRepository.TABLE_NAME = TABLE_NAME;

export default ThresholdItemRepository;
