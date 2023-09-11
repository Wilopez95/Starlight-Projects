/* eslint-disable id-match */
import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';

import { getTaxesInfo } from './utils/getTaxesInfo.js';
import { mapSubscriptionProration } from './utils/mapSubscriptionProration.js';
import { getСurrentBillingPeriodStartDate } from './utils/getСurrentBillingPeriodStartDate.js';
import { displayReviewProrationButton } from './utils/displayReviewProrationButton.js';
import { recalculateSubscriptionSummary } from './utils/recalculateSubscriptionSummary.js';
import { getGroupedProration } from './utils/getGroupedProration.js';
import { subscriptionsSummary } from './utils/subscriptionsSummary.js';

export const recalculateSubscriptionSummaryProration = async (ctx, data) => {
  const { serviceItems, startDate, endDate, billingCycle, anniversaryBilling } = data;

  const taxesInfo = getTaxesInfo();

  const serviceItemIds = [];
  const lineBillableItemIds = [];

  for (const serviceItem of serviceItems) {
    const { serviceItemId, lineItems = [] } = serviceItem;
    serviceItemIds.push(serviceItemId);
    const lineIds = lineItems.map(({ billableLineItemId }) => billableLineItemId);
    lineBillableItemIds.push(...lineIds);
  }
  const serviceItemsHt = await SubscriptionServiceItemRepo.getInstance(
    ctx.state,
  ).getHistoryRecordForProration({
    serviceItemIds,
    lineBillableItemIds,
  });

  const showProrationButton = displayReviewProrationButton(serviceItems, serviceItemsHt);
  const infoForProrationCalc = serviceItems.concat(serviceItemsHt);

  const startCalendarDate = getСurrentBillingPeriodStartDate({
    startDate,
    endDate,
    billingCycle,
    anniversaryBilling,
  });

  const prorationInfo = recalculateSubscriptionSummary({
    groupedServiceItems: infoForProrationCalc,
    startDate: startCalendarDate,
    billingCycle,
    anniversaryBilling,
    endDate,
  });

  const summary = subscriptionsSummary({
    taxesTotal: taxesInfo.taxesTotal,
    prorationInfo: getGroupedProration(prorationInfo),
  });
  const result = {
    showProrationButton: !!showProrationButton,
    prorationInfo: getGroupedProration(prorationInfo),
    taxesInfo,
    ...summary,
  };

  return mapSubscriptionProration(result);
};
