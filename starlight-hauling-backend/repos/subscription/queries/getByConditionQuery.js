import JobSiteRepo from '../../jobSite.js';

import { detailsFields } from '../../../consts/subscriptions.js';
import { populateDataQuery } from './populateDataQuery.js';
import { filterByCustomer } from './filterByCustomer.js';
import { applyCommonFilters } from './applyCommonFilters.js';

export const getByConditionQuery = (
  trx,
  tableName,
  schemaName,
  {
    condition: {
      ids,
      businessUnitId,
      businessLineId,
      jobSiteId,
      jobSite,
      customerName,
      customerId,
      ...condition
    } = {},
    fields = detailsFields,
    skip = 0,
    limit = 25,
  },
) => {
  let query = populateDataQuery(trx, tableName, schemaName, {
    fields,
  });
  if (limit) {
    query = query.limit(limit);
  }
  if (skip) {
    query = query.offset(skip);
  }

  if (customerId) {
    query = query.where(`${tableName}.customerId`, customerId);
  }

  if (ids) {
    query = query.whereIn(`${tableName}.id`, ids);
  }

  if (businessUnitId) {
    query = query.andWhere(`${tableName}.businessUnitId`, businessUnitId);
  }
  if (businessLineId) {
    query = query.andWhere(`${tableName}.businessLineId`, businessLineId);
  }

  query = applyCommonFilters(tableName, condition, query);

  if (jobSiteId) {
    const jobsiteHT = JobSiteRepo.getHistoricalTableName();

    query = query.andWhere(`${jobsiteHT}.originalId`, jobSiteId);
  }

  if (jobSite) {
    const JobSiteHT = JobSiteRepo.getHistoricalTableName();
    const concat = trx.raw(
      `CONCAT(${JobSiteHT}.address_line_1,${JobSiteHT}.address_line_2,${JobSiteHT}.city,${JobSiteHT}.state)`,
    );
    query = query.andWhere(concat, 'ilike', `%${jobSite}%`);
  }
  query = filterByCustomer({ trx, query, customerName, join: false });

  return query;
};
