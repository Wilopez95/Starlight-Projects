import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';
import FrequencyRepo from '../../frequency.js';

export const getAvailableFilters = async (trx, tableName, schemaName) => {
  const baseQuery = trx(tableName).withSchema(schemaName);
  const promises = [];

  promises.push(
    baseQuery
      .clone()
      .select([trx.raw('array_agg(distinct ??) as ??', ['businessLineId', 'businessLine'])])
      .first(),
  );

  promises.push(
    baseQuery
      .clone()
      .select([trx.raw('array_agg(distinct ??) as ??', ['billingCycle', 'billingCycle'])])
      .first(),
  );

  promises.push(
    trx(SubscriptionServiceItemRepo.TABLE_NAME)
      .withSchema(schemaName)
      .select([
        trx.raw('distinct ??', [`${FrequencyRepo.TABLE_NAME}.id`]),
        `${FrequencyRepo.TABLE_NAME}.times`,
        `${FrequencyRepo.TABLE_NAME}.type`,
      ])
      .innerJoin(
        FrequencyRepo.TABLE_NAME,
        `${SubscriptionServiceItemRepo.TABLE_NAME}.serviceFrequencyId`,
        `${FrequencyRepo.TABLE_NAME}.id`,
      )
      .as('serviceFrequency'),
  );

  const filters = await Promise.all(promises);
  return filters.reduce((result, el) => {
    let obj = el;
    if (Array.isArray(el)) {
      obj = { serviceFrequency: el };
    }
    return {
      ...result,
      ...obj,
    };
  }, {});
};
