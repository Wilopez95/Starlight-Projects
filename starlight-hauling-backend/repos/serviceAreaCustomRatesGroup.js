import BaseRepository from './_base.js';

const TABLE_NAME = 'service_areas_custom_rates_groups';

class ServiceAreaCustomRateGroup extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async insertMany({ data, customRatesGroupId }, trx = this.knex) {
    const addedServiceAreaIds = data.map(serviceAreaId => ({
      serviceAreaId,
      customRatesGroupId,
    }));

    await super.insertMany({ data: addedServiceAreaIds }, trx);
  }
}

ServiceAreaCustomRateGroup.TABLE_NAME = TABLE_NAME;

export default ServiceAreaCustomRateGroup;
