import { ISubscriptionProration } from '@root/types';

import { IProrationLineItem, IProrationServiceItem, IReviewProrationFormData } from './types';

export const getInitialValues = (proration: ISubscriptionProration): IReviewProrationFormData => ({
  serviceItems: proration.prorationInfo.reduce(
    (initialServices: IProrationServiceItem[], billingPeriods) => [
      ...initialServices,
      ...billingPeriods.map(
        ({
          serviceItemId,
          billableServiceId,
          serviceItemProrationInfo,
          lineItemsProrationInfo,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        }): IProrationServiceItem => {
          const prorationEffectiveDate = serviceItemProrationInfo?.effectiveDate ?? null;

          const proratedTotal = serviceItemProrationInfo?.proratedTotal ?? null;

          return {
            isProrated: !!serviceItemProrationInfo,
            id: serviceItemId || billableServiceId,
            billableServiceId,
            prorationEffectiveDate,
            price: proratedTotal,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
            prorationEffectivePrice: proratedTotal,
            lineItems: lineItemsProrationInfo.map(
              (lineItem): IProrationLineItem => ({
                id: lineItem.lineItemId || lineItem.billableLineItemId,
                prorationEffectiveDate,
                price: lineItem.proratedTotal,
                billableLineItemId: lineItem.billableLineItemId,
                prorationEffectivePrice: lineItem.proratedTotal,
                nextBillingPeriodFrom: lineItem.nextBillingPeriodFrom,
                nextBillingPeriodTo: lineItem.nextBillingPeriodTo,
              }),
            ),
          };
        },
      ),
    ],
    [],
  ),
});
