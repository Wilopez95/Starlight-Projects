import { pricingGetSubscriptionServiceItemBy } from '../../../../services/pricing.js';
import getServiceItemProrationInfo from './getServiceItemProrationInfo.js';
import getLineItemProrationInfo from './getLineItemProrationInfo.js';
import getSubscriptionOrdersInPeriod from './getSubscriptionOrdersInPeriod.js';

const getBillingPeriodsWithProration = (
  ctx,
  {
    billingCycle,
    prorationPeriods,
    serviceItems,
    businessUnitId,
    businessLineId,
    customRatesGroupId,
    billableServiceInclusions,
    today,
  },
  dependencies,
) => {
  return Promise.all(
    prorationPeriods.map(billingPeriod =>
      Promise.all(
        billingPeriod.map(
          (
            { nextBillingPeriodFrom, nextBillingPeriodTo, periodFrom, periodTo },
            prorationPeriodIdx,
          ) => {
            return Promise.all(
              serviceItems.map(async serviceItem => {
                const {
                  prorationType,
                  serviceDaysOfWeek,
                  billableServiceId,
                  serviceItemId,
                  lineItems = [],
                  subscriptionOrders = [],
                } = serviceItem;

                const { subscriptionOrdersTotal, subscriptionOrdersInPeriod } =
                  await getSubscriptionOrdersInPeriod({
                    periodFrom,
                    periodTo,
                    subscriptionOrders,
                  });

                const isLastProrationPeriodInBillingCycle =
                  prorationPeriodIdx + 1 === billingPeriod.length;

                let oldServiceItems;
                if (serviceItem.serviceItemId) {
                  oldServiceItems = await pricingGetSubscriptionServiceItemBy(ctx, {
                    data: { id: serviceItem.serviceItemId },
                  });
                }

                const { serviceItemProrationInfo, frequency, prevProration } =
                  await getServiceItemProrationInfo(
                    ctx,
                    {
                      serviceItem,
                      billingCycle,
                      nextBillingPeriodFrom,
                      nextBillingPeriodTo,
                      periodFrom,
                      periodTo,
                      businessUnitId,
                      businessLineId,
                      customRatesGroupId,
                      subscriptionOrdersTotal,
                      billableServiceInclusions,
                      today,
                      isLastProrationPeriodInBillingCycle,
                      oldServiceItems,
                    },
                    dependencies,
                  );

                const lineItemsProrationInfo = await Promise.all(
                  lineItems?.map(lineItem => {
                    return getLineItemProrationInfo(
                      ctx,
                      {
                        prorationType,
                        serviceDaysOfWeek,
                        lineItem,
                        nextBillingPeriodFrom,
                        nextBillingPeriodTo,
                        periodFrom,
                        periodTo,
                        billingCycle,
                        businessUnitId,
                        businessLineId,
                        customRatesGroupId,
                        today,
                        ...frequency,
                        isLastProrationPeriodInBillingCycle,
                      },
                      dependencies,
                    );
                  }),
                );

                return {
                  materialId: serviceItem.materialId,
                  subscriptionOrders: subscriptionOrdersInPeriod,
                  billableServiceId,
                  serviceItemId,
                  nextBillingPeriodFrom,
                  nextBillingPeriodTo,
                  periodFrom,
                  periodTo,
                  serviceItemProrationInfo,
                  lineItemsProrationInfo,
                  prevProration,
                };
              }),
            );
          },
        ),
      ),
    ),
  );
};
export default getBillingPeriodsWithProration;
