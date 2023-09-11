import { makeHaulingRequest } from '../utils/makeRequest.js';

export const getSubsTotalForCurrentPeriod = async (schemaName, customerId) => {
  const { subsTotalForCurrentPeriod, subsTotalPaid, notInvoicedSubsOrdersTotal } =
    await makeHaulingRequest(
      {},
      {
        method: 'get',
        url: '/subscriptions/total-for-current-period',
        params: {
          schemaName,
          customerId,
        },
      },
    );
  return { subsTotalForCurrentPeriod, subsTotalPaid, notInvoicedSubsOrdersTotal };
};
