import isEmpty from 'lodash/isEmpty.js';

import ServiceAreaRepo from '../../serviceArea.js';
import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';
import JobSiteRepo from '../../jobSite.js';
import BillableServiceRepo from '../../billableService.js';

import { unambiguousCondition } from '../../../utils/dbHelpers.js';
import { subscriptionGridFields } from '../../../consts/subscriptions.js';
import { populateDataQuery } from './populateDataQuery.js';
import { filterByCustomer } from './filterByCustomer.js';
import { applyCommonFilters } from './applyCommonFilters.js';

export const getAllQuery = (
  trx,
  tableName,
  schemaName,
  {
    condition: {
      status,
      csrEmail,
      ids,
      customerId,
      customerName,
      jobSiteId,
      jobSite,
      serviceAreaId,
      businessLine,
      startDateTo,
      ratesChanged,
      startDateFrom,
      paymentMethod,
      serviceFrequencyId,
      billingCycle,
      ...condition
    } = {},
    fields = subscriptionGridFields,
  },
) => {
  let subscriptionFields = fields;
  if (serviceAreaId && !fields.includes('serviceAreaId')) {
    subscriptionFields = fields.concat('serviceAreaId');
  }

  let query = populateDataQuery(trx, tableName, schemaName, {
    fields: subscriptionFields,
  });

  if (Array.isArray(status)) {
    query = query.whereIn(`${tableName}.status`, status);
  } else if (status) {
    query = query.where(`${tableName}.status`, status);
  }
  if (csrEmail) {
    query = query.andWhere({ csrEmail });
  }
  if (customerId) {
    query = filterByCustomer({ trx, query, customersIds: [customerId], join: false });
  }
  if (customerName) {
    query = filterByCustomer({ trx, query, customerName, join: false });
  }
  if (jobSiteId) {
    const jobsiteHT = JobSiteRepo.getHistoricalTableName();

    query = query.andWhere(`${jobsiteHT}.originalId`, jobSiteId);
  }
  if (jobSite) {
    const jobsiteHT = JobSiteRepo.getHistoricalTableName();
    const concat = trx.raw(
      `CONCAT(${jobsiteHT}.address_line_1,${jobsiteHT}.address_line_2,${jobsiteHT}.city,${jobsiteHT}.state)`,
    );
    query = query.andWhere(concat, 'ilike', `%${jobSite}%`);
  }
  if (serviceAreaId) {
    const serviceAreaHT = ServiceAreaRepo.getHistoricalTableName();

    query = query.andWhere(`${serviceAreaHT}.originalId`, serviceAreaId);
  }

  if (!isEmpty(condition)) {
    query = query.andWhere(unambiguousCondition(tableName, condition));
  }

  const BillableServiceHT = BillableServiceRepo.getHistoricalTableName();

  query = query
    .leftJoin(
      SubscriptionServiceItemRepo.TABLE_NAME,
      `${SubscriptionServiceItemRepo.TABLE_NAME}.subscriptionId`,
      `${tableName}.id`,
    )
    .leftJoin(
      BillableServiceHT,
      `${BillableServiceHT}.id`,
      `${SubscriptionServiceItemRepo.TABLE_NAME}.billableServiceId`,
    );

  return applyCommonFilters(
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
  );
};
