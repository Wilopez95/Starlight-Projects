import BusinessLineRepo from '../../businessLine.js';
import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';

export const applyCommonFilters = (
  tableName,
  {
    businessLine,
    startDateTo,
    startDateFrom,
    paymentMethod,
    serviceFrequencyId,
    billingCycle,
    ratesChanged,
  },
  query,
) => {
  let modQuery = query;
  if (businessLine?.length) {
    modQuery = modQuery.whereIn(`${BusinessLineRepo.TABLE_NAME}.id`, businessLine);
  }
  if (startDateTo) {
    modQuery = modQuery.andWhere(`${tableName}.startDate`, '<', startDateTo);
  }
  if (startDateFrom) {
    modQuery = modQuery.andWhere(`${tableName}.startDate`, '>=', startDateFrom);
  }
  if (paymentMethod?.length) {
    modQuery = modQuery.whereIn(`${tableName}.paymentMethod`, paymentMethod);
  }
  if (billingCycle?.length) {
    modQuery = modQuery.whereIn(`${tableName}.billingCycle`, billingCycle);
  }
  if (ratesChanged) {
    modQuery = modQuery
      .whereNull(`${tableName}.invoicedDate`)
      .andWhere(`${tableName}.ratesChanged`, ratesChanged);
  }
  if (serviceFrequencyId?.length) {
    modQuery = modQuery.whereIn(
      `${SubscriptionServiceItemRepo.TABLE_NAME}.serviceFrequencyId`,
      serviceFrequencyId,
    );
  }
  return modQuery;
};
