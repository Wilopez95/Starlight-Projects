import CustomerJobSitePairRepo from '../../repos/customerJobSitePair.js';

import { getCustomerJobSitePairInputFields } from '../../consts/subscriptions.js';

/**
 * Creates and returns the customer/jobsite object
 */
export const getSubscriptionDependencies = async (ctxState, { data }, trx) => {
  const customerJobSitePairRepo = CustomerJobSitePairRepo.getInstance(ctxState);

  const customerJobSitePairData = getCustomerJobSitePairInputFields(data);
  const linkedPair = await customerJobSitePairRepo.upsert(
    {
      data: Object.assign(customerJobSitePairData, {
        active: true,
      }),
      constraints: ['jobSiteId', 'customerId'],
    },
    trx,
  );

  return { linkedPair };
};
