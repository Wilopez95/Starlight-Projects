import compose from 'lodash/fp/compose.js';

import RatesRepository from './_rates.js';
import BillableLineItemRepo from './billableLineItem.js';
import MaterialRepo from './material.js';

const TABLE_NAME = 'global_rates_line_items';

class GlobalRatesLineItemRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            line_item_id,
            coalesce(material_id, '-1'::integer)
        `;
    // audit log needs
    this.upsertConstraints = ['businessUnitId', 'businessLineId', 'lineItemId', 'materialId'];
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];

    ({ query, selects } = await super.populateBuBl({ query, selects }));

    let jtName = BillableLineItemRepo.TABLE_NAME;
    let joinedTableColumns = await BillableLineItemRepo.getColumnsToSelect({
      alias: 'billableLineItem',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.lineItemId`);

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
    billableLineItemId: lineItemId,
    materialId,
    specifiedDate,
  }) {
    const result = await this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .first(['price', 'originalId as globalRatesLineItemsId'])
      .where({
        businessLineId,
        businessUnitId,
        lineItemId,
        materialId,
      })
      .andWhere('createdAt', '<=', specifiedDate)
      .orderBy('createdAt', 'desc');

    return result;
  }
}

GlobalRatesLineItemRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesLineItemRepository;
