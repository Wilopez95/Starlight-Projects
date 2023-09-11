import BaseRepository from './_base.js';
import TaxDistrictRepository from './taxDistrict.js';

const TABLE_NAME = 'order_tax_district';

class OrderTaxDistrictRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  getByOrderId(orderId, trx = this.knex) {
    const historicalRepo = TaxDistrictRepository.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    });

    const condition = builder =>
      builder.whereIn(
        'td.id',
        trx(this.tableName)
          .withSchema(this.schemaName)
          .select('taxDistrictId')
          .where('orderId', orderId),
      );

    return historicalRepo.getBy({ condition }, trx);
  }

  async getDescriptionsByOrderIds(orderIds, trx = this.knex) {
    const tdTableName = TaxDistrictRepository.getHistoricalTableName();
    const taxDistricts = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select(trx.raw(`array_agg(${tdTableName}.description) as descriptions`), 'orderId')
      .leftJoin(tdTableName, `${tdTableName}.id`, `${this.tableName}.taxDistrictId`)
      .whereIn('orderId', orderIds)
      .groupBy('orderId')
      .orderBy('orderId');

    if (!taxDistricts) {
      return null;
    }

    return taxDistricts.reduce(
      (acc, { orderId, descriptions }) =>
        Object.assign(acc, {
          [orderId]: descriptions.map(description => ({ description })),
        }),
      {},
    );
  }

  async insertWithNonHistoricalIds({ orderId, taxDistrictIds }, trx = this.knex) {
    const historicalIds = await BaseRepository.getNewestHistoricalRecords(
      {
        tableName: TaxDistrictRepository.TABLE_NAME,
        schemaName: this.schemaName,
        originalIds: taxDistrictIds,
        fields: ['id'],
      },
      trx,
    );

    await trx(this.tableName)
      .withSchema(this.schemaName)
      .insert(historicalIds.map(({ id }) => ({ taxDistrictId: id, orderId })));
  }

  async calcInsertWithNonHistoricalIds({ orderId, taxDistrictIds }, trx = this.knex) {
    const historicalIds = await BaseRepository.getNewestHistoricalRecords(
      {
        tableName: TaxDistrictRepository.TABLE_NAME,
        schemaName: this.schemaName,
        originalIds: taxDistrictIds,
        fields: ['id'],
      },
      trx,
    );

    return historicalIds.map(({ id }) => ({ taxDistrictId: id, orderId }));
  }
}

OrderTaxDistrictRepository.TABLE_NAME = TABLE_NAME;

export default OrderTaxDistrictRepository;
