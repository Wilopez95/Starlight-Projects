import compose from 'lodash/fp/compose.js';

import RatesRepository from './_rates.js';
import BillableSurchargeRepo from './billableSurcharge.js';
import MaterialRepo from './material.js';

const TABLE_NAME = 'global_rates_surcharges';

class GlobalRatesSurchargeRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            surcharge_id,
            coalesce(material_id, '-1'::integer)
        `;
    // audit log needs
    this.upsertConstraints = ['businessUnitId', 'businessLineId', 'surchargeId', 'materialId'];
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];

    ({ query, selects } = await super.populateBuBl({ query, selects }));

    let jtName = BillableSurchargeRepo.TABLE_NAME;
    let joinedTableColumns = await BillableSurchargeRepo.getColumnsToSelect({
      alias: 'billableSurcharge',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.surchargeId`);

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

GlobalRatesSurchargeRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesSurchargeRepository;
