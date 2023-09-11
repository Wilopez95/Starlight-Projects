import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import { getLinkedInputFields, getNonLinkedInputFields } from '../../consts/subscriptions.js';
import { getServiceAndLineItemHistoricalIds } from './getServiceAndLineItemHistoricalIds.js';
import { getNextBillingPeriod } from './utils/getNextBillingPeriod.js';
import { getLinkedHistoricalIds } from './getLinkedHistoricalIds.js';

export const prepHistoricalAndComputedFields = async (
  trx,
  schemaName,
  getHistoricalTableName,
  { data, linkedPair },
) => {
  const result = getNonLinkedInputFields(data);

  const linkedData = getLinkedInputFields(data);

  const historicalLinkedFields = await getLinkedHistoricalIds(
    trx,
    schemaName,
    // getHistoricalTableName,
    { linkedData },
  );

  Object.assign(result, historicalLinkedFields);

  const {
    serviceItems,
    billableServicesTotal,
    billableLineItemsTotal,
    billableSubscriptionOrdersTotal,
    originalIdsMap,
    // pre-pricing service code:
    // } = await getServiceAndLineItemHistoricalIds(trx, schemaName, getHistoricalTableName, {
    //   serviceItems: data.serviceItems,
    // });
  } = await getServiceAndLineItemHistoricalIds(
    trx,
    schemaName,
    {
      serviceItems: data.serviceItems,
    },
    true,
  );
  result.serviceItems = serviceItems;
  result.billableServicesTotal = billableServicesTotal;
  result.billableLineItemsTotal = billableLineItemsTotal;
  result.billableSubscriptionOrdersTotal = billableSubscriptionOrdersTotal;
  result.originalIdsMap = originalIdsMap;

  result.currentSubscriptionPrice =
    billableServicesTotal + billableLineItemsTotal + billableSubscriptionOrdersTotal;

  result.beforeTaxesTotal = billableServicesTotal + billableLineItemsTotal;

  result.status = SUBSCRIPTION_STATUS.active;

  const { nextBillingPeriodFrom, nextBillingPeriodTo } = getNextBillingPeriod(data);

  result.nextBillingPeriodFrom = nextBillingPeriodFrom;
  result.nextBillingPeriodTo = nextBillingPeriodTo;

  const taxesTotal = 0;
  // TODO: calculateTaxes, will be implemented in future, currently under BA

  result.grandTotal = result.currentSubscriptionPrice + taxesTotal;
  result.initialGrandTotal = result.grandTotal;
  result.jobSiteNote = result.popupNote || linkedPair.popupNote;

  return result;
};
