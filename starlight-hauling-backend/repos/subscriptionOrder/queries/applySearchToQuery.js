import SubscriptionRepo from '../../subscription/subscription.js';
import CustomerRepo from '../../customer.js';
import JobSiteRepo from '../../jobSite.js';

import { TABLE_NAME } from '../../../consts/subscriptionOrders.js';

export const applySearchToQuery = (originalQuery, { searchId, searchQuery }) => {
  let query = originalQuery;

  query = query.andWhere(builder => {
    if (searchId) {
      builder.orWhere(`${TABLE_NAME}.id`, searchId);
      builder.orWhere(`${SubscriptionRepo.TABLE_NAME}.id`, searchId);
    }

    if (searchQuery?.length >= 3) {
      const customerHT = CustomerRepo.getHistoricalTableName();
      const jobSiteHT = JobSiteRepo.getHistoricalTableName();

      builder
        .orWhereRaw('??.name %> ?', [customerHT, searchQuery])
        .orderByRaw('??.name <-> ?', [CustomerRepo.getHistoricalTableName(), searchQuery]);

      builder
        .orWhereRaw('? <% ??.full_address', [searchQuery, jobSiteHT])
        .orderByRaw('? <<-> ??.full_address', [searchQuery, jobSiteHT]);
    }

    return builder;
  });

  return query;
};
