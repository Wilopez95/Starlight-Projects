import { convertDateKey } from './convertDateKey.js';
import { calcServiceTotal } from './calcServiceTotal.js';
import { calcLineItemsTotal } from './calcLineItemsTotal.js';
import { calcOrdersTotal } from './calcOrdersTotal.js';
import { convertProrationInfo } from './convertProrationInfo.js';

export const mapSubscriptionProration = proration => ({
  ...convertDateKey(proration),
  serviceTotal: calcServiceTotal(proration.prorationInfo[1]),
  lineItemsTotal: calcLineItemsTotal(proration.prorationInfo[1]),
  subscriptionOrdersTotal: calcOrdersTotal(proration.prorationInfo[1]),
  grandTotal: proration.summaryForFirstBillingPeriod,
  prorationPeriods: proration.prorationInfo.map(prorationInfo =>
    convertProrationInfo(prorationInfo),
  ),
});
