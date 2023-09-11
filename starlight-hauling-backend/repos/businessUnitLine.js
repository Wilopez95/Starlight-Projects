import BaseRepository from './_base.js';

const TABLE_NAME = 'business_units_lines';

class BusinessUnitLineRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId', 'businessLineId'];
  }

  async updateDefaultBillingItem({ data }, trx) {
    const _trx = trx || (await this.knex.transaction());

    const { businessUnitId, businessLines } = data;

    try {
      const promises = [];

      for (const businessLineInfo of businessLines) {
        const { id, ...rest } = businessLineInfo;
        const businessLine = await super.updateBy(
          {
            condition: { businessLineId: id, businessUnitId },
            data: rest,
          },
          _trx,
        );

        promises.push(businessLine);
      }

      await Promise.all(promises);

      if (!trx) {
        await _trx.commit();
      }
    } catch (err) {
      if (!trx) {
        await _trx.rollback();
      }
      throw err;
    }
  }
}

BusinessUnitLineRepository.TABLE_NAME = TABLE_NAME;

export default BusinessUnitLineRepository;
