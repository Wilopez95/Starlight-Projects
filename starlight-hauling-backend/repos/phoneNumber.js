import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import compact from 'lodash/compact.js';

import BaseRepository from './_base.js';

const TABLE_NAME = 'phone_numbers';

class PhoneNumberRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async updateMany({ condition, data = [], fields = ['*'] }, trx = this.knex) {
    const items = await Promise.all(
      data
        .map(phoneNumber => Object.assign(phoneNumber, condition))
        .map(
          ({ id, ...pnData }) =>
            id
              ? super.updateBy(
                  {
                    condition: { id },
                    data: pnData,
                    fields,
                  },
                  trx,
                )
              : super.createOne(
                  {
                    data: pnData,
                    fields,
                  },
                  trx,
                ),
          this,
        ),
    );

    await this.deleteByExcludingIds(
      {
        condition,
        // filter for cases when passed ids are wrong - clear
        ids: isEmpty(items) ? [] : compact(map(items, 'id')),
      },
      trx,
    );

    return items;
  }

  getByContactId(contactId, fields = ['*'], trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(`${this.tableName}.contactId`, contactId)
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`);
  }

  deleteByExcludingIds({ condition = {}, ids = [] } = {}, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereNotIn('id', ids)
      .andWhere(condition)
      .delete();
  }
}

PhoneNumberRepository.TABLE_NAME = TABLE_NAME;

export default PhoneNumberRepository;
