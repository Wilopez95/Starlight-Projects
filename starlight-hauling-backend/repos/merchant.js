import compose from 'lodash/fp/compose.js';

import BaseRepository from './_base.js';

const TABLE_NAME = 'merchants';

class MerchantRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId', 'paymentGateway'];
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        delete obj.password;
        delete obj.salespointPassword;

        return obj;
      },
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async createOne({ data, fields = '*' } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    let result;
    try {
      result = await super.createOne({ data, fields }, _trx);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }

    return result;
  }

  async getByBusinessUnit({ condition: { businessUnitId } } = {}, trx = this.knex) {
    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ businessUnitId })
      .select(['*']);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }
}

MerchantRepository.TABLE_NAME = TABLE_NAME;

export default MerchantRepository;
