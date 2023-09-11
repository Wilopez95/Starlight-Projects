import compose from 'lodash/fp/compose.js';

import { unambiguousCondition } from '../utils/dbHelpers.js';
import RatesRepository from './_rates.js';
import BillableServiceRepo from './billableService.js';
import EquipmentItemRepo from './equipmentItem.js';
import MaterialRepo from './material.js';

const TABLE_NAME = 'global_rates_services';

class GlobalRatesServiceRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            billable_service_id,
            coalesce(material_id, '-1'::integer),
            equipment_item_id
        `;
    // audit log needs
    this.upsertConstraints = [
      'businessUnitId',
      'businessLineId',
      'billableServiceId',
      'materialId',
      'equipmentItemId',
    ];
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];

    ({ query, selects } = await super.populateBuBl({ query, selects }));

    let jtName = BillableServiceRepo.TABLE_NAME;
    let joinedTableColumns = await BillableServiceRepo.getColumnsToSelect({
      alias: 'billableService',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.billableServiceId`);

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

  async getRateBySpecificDate({
    businessUnitId,
    businessLineId,
    billableServiceId,
    materialId,
    specifiedDate,
  }) {
    try {
      const query = this.knex(this.historicalTableName)
        .withSchema(this.schemaName)
        .first(['price', 'originalId as globalRatesServicesId'])
        .where({
          businessUnitId,
          businessLineId,
          billableServiceId,
          materialId,
        })
        .orderBy('createdAt', 'desc');

      if (specifiedDate !== undefined) {
        query.andWhere('createdAt', '<=', specifiedDate);
      }

      const result = await query;

      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getSalesPointRates({ condition, fields = '*' }) {
    const items = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .select(fields)
      .innerJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billable_service_id`,
      )
      .andWhere(`${BillableServiceRepo.TABLE_NAME}.spUsed`, true)
      .andWhereRaw(
        `${BillableServiceRepo.TABLE_NAME}.equipment_item_id = ${this.tableName}.equipment_item_id`,
      )
      .whereNotNull(`${this.tableName}.materialId`)
      .andWhere(`${this.tableName}.price`, '>', 0);

    return items?.map(super.mapFields.bind(this)) ?? [];
  }
}

GlobalRatesServiceRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesServiceRepository;
