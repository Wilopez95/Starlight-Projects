import compose from 'lodash/fp/compose.js';

import RatesRepository from './_rates.js';
import ThresholdRepo from './threshold.js';
import EquipmentItemRepo from './equipmentItem.js';
import MaterialRepo from './material.js';
import GlobalThresholdsSettingRepo from './globalThresholdsSetting.js';

const TABLE_NAME = 'global_rates_thresholds';

class GlobalRatesThresholdRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            threshold_id,
            coalesce(equipment_item_id, '-1'::integer),
            coalesce(material_id, '-1'::integer)
        `;
    // audit log needs
    this.upsertConstraints = [
      'businessUnitId',
      'businessLineId',
      'thresholdId',
      'equipmentItemId',
      'materialId',
    ];
  }

  async upsertMany({ data, constraints, concurrentData, log }) {
    data.equipmentItemId || (data.equipmentItemId = null);
    data.materialId || (data.materialId = null);

    await super.upsertMany({
      data,
      concurrentData,
      constraints,
      log,
    });
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];

    ({ query, selects } = await super.populateBuBl({ query, selects }));

    let jtName = ThresholdRepo.TABLE_NAME;
    let joinedTableColumns = await ThresholdRepo.getColumnsToSelect({
      alias: 'threshold',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.thresholdId`);

    jtName = EquipmentItemRepo.TABLE_NAME;
    joinedTableColumns = await EquipmentItemRepo.getColumnsToSelect({
      alias: 'equipment',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.equipmentItemId`);

    jtName = MaterialRepo.TABLE_NAME;
    joinedTableColumns = await MaterialRepo.getColumnsToSelect({
      alias: 'material',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.materialId`);

    jtName = GlobalThresholdsSettingRepo.TABLE_NAME;
    joinedTableColumns = await GlobalThresholdsSettingRepo.getColumnsToSelect({
      alias: 'settings',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.thresholdId`, `${this.tableName}.id`);

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, this.mapFields)(item) : null;
  }

  async getHistoricalById({ condition }, trx = this.knex) {
    const item = await trx('global_rates_thresholds_historical')
      .withSchema(this.schemaName)
      .select(['*'])
      .where(condition)
      .orderBy('id', 'desc')
      .first();

    return item;
  }
}

GlobalRatesThresholdRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesThresholdRepository;
