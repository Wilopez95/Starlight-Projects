import { camelCaseKeys } from '../utils/dbHelpers.js';
import BaseRepository from './_base.js';

const TABLE_NAME = 'business_unit_mail_settings';

class BusinessUnitMailSettings extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId'];
  }

  async upsert({ data, constraints, concurrentData } = {}, trx = this.knex) {
    const result = await super.upsert({ data, constraints, concurrentData }, trx);

    return result ? camelCaseKeys(result) : null;
  }
}

BusinessUnitMailSettings.TABLE_NAME = TABLE_NAME;

export default BusinessUnitMailSettings;
