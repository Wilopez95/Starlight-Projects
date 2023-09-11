import pick from 'lodash/pick.js';
import compose from 'lodash/fp/compose.js';

import isNilOrNaN from '../utils/isNilOrNumeric.js';
import RatesRepository from './_rates.js';
import CustomRatesGroupRepo from './customRatesGroup.js';
import ThresholdRepo from './threshold.js';
import EquipmentItemRepo from './equipmentItem.js';
import MaterialRepo from './material.js';

const TABLE_NAME = 'custom_rates_group_thresholds';

class CustomRatesGroupThresholdRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            custom_rates_group_id,
            threshold_id,
            coalesce(equipment_item_id, '-1'::integer),
            coalesce(material_id, '-1'::integer)
        `;
    this.upsertConstraints = [
      'businessUnitId',
      'businessLineId',
      'customRatesGroupId',
      'thresholdId',
      'materialId',
      'equipmentItemId',
    ];
  }

  async upsertMany({
    condition: { customRatesGroupId },
    data: inputData,
    constraints,
    concurrentData,
    log,
  }) {
    const itemsToRemove = [];
    const data = inputData.filter(item => {
      item.customRatesGroupId = customRatesGroupId;

      if (isNilOrNaN(item.price) && !item.limit) {
        itemsToRemove.push(pick(item, this.constraints));
        return false;
      }
      return true;
    });

    const trx = await this.knex.transaction();

    try {
      if (data?.length) {
        data.equipmentItemId || (data.equipmentItemId = null);
        data.materialId || (data.materialId = null);

        await super.upsertMany(
          {
            data,
            concurrentData,
            constraints,
            log,
          },
          trx,
        );
      }

      if (itemsToRemove?.length) {
        await Promise.all(
          itemsToRemove.map(condition => this.deleteBy({ condition, log }, trx), this),
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];

    ({ query, selects } = await super.populateBuBl({ query, selects }));

    let jtName = CustomRatesGroupRepo.TABLE_NAME;
    let joinedTableColumns = await CustomRatesGroupRepo.getColumnsToSelect({
      alias: 'customRatesGroup',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.customRatesGroupId`);

    jtName = ThresholdRepo.TABLE_NAME;
    joinedTableColumns = await ThresholdRepo.getColumnsToSelect({
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

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, this.mapFields)(item) : null;
  }
}

CustomRatesGroupThresholdRepository.TABLE_NAME = TABLE_NAME;

export default CustomRatesGroupThresholdRepository;
