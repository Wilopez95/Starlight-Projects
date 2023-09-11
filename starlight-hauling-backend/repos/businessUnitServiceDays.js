import compose from 'lodash/fp/compose.js';
import BaseRepository from './_base.js';

const TABLE_NAME = 'business_unit_service_days';

class BusinessUnitServiceDaysRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(super.camelCaseKeys, super.mapFields)(originalObj);
  }

  async getByBusinessUnit({ condition: { businessUnitId } } = {}, trx = this.knex) {
    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .distinctOn(`${this.tableName}.dayOfWeek`)
      .where({ businessUnitId });

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async addServiceDays(businessUnitId, serviceDays) {
    const serviceDaysData = serviceDays.map(serviceDay => ({
      businessUnitId,
      ...serviceDay,
    }));

    await super.insertMany({
      data: serviceDaysData,
    });
  }

  async updateServiceDays(businessUnitId, serviceDays) {
    const promises = serviceDays.map(async ({ id, ...rest }) => {
      await super.updateBy({
        condition: { businessUnitId, id },
        data: rest,
      });
    });

    await Promise.all(promises);
  }
}

BusinessUnitServiceDaysRepository.TABLE_NAME = TABLE_NAME;

export default BusinessUnitServiceDaysRepository;
