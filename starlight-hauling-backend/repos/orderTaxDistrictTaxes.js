import BaseRepository from './_base.js';

const TABLE_NAME = 'order_tax_district_taxes';

class OrderTaxDistrictTaxesRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async insertMany({ data, orderTaxDistrictIds }, trx = this.knex) {
    await this.deleteBy(
      { condition: qb => qb.whereIn('orderTaxDistrictId', orderTaxDistrictIds) },
      trx,
    );
    await super.insertMany({ data }, trx);
  }
}

OrderTaxDistrictTaxesRepository.TABLE_NAME = TABLE_NAME;

export default OrderTaxDistrictTaxesRepository;
