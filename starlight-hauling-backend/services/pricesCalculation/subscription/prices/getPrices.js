import { max as maxDate } from 'date-fns';
import GlobalRatesServiceRepository from '../../../../repos/globalRatesService.js';
import calculateRecurringServiceItemPrice from './recurringServiceItemPrice.js';
import calculateRecurringLineItemPrice from './recurringLineItemPrice.js';
import calculateSubscriptionOrderPrice from './subscriptionOrderPrice.js';

const getPrices = async (
  ctx,
  {
    businessUnitId,
    businessLineId,
    billingCycle,
    startDate,
    customRatesGroupId,
    serviceItems,
    today,
    billableServiceInclusions,
    forceInput = true,
  },
  dependencies,
) => {
  const prices = await Promise.all(
    serviceItems.map(
      async ({
        price: overriddenServiceItemPrice,
        effectiveDate: serviceItemEffectiveDate,
        billableServiceId: serviceItemBillableServiceId,
        materialId,
        serviceItemId,
        serviceFrequencyId,
        lineItems,
        subscriptionOrders,
      }) => {
        const serviceItemSpecifiedDate = maxDate([
          startDate ? new Date(startDate) : today,
          serviceItemEffectiveDate ?? today,
          today,
        ]);
        console.log(
          '🚀 aa5 ~ file: getPrices.js:40 ~  ~ starting timer for calculateRecurringServiceItemPrice:🚀',
        );
        let start = Date.now();
        const {
          price: serviceItemPrice,
          globalRatesRecurringServicesId = null,
          customRatesGroupServicesId = null,
        } = await calculateRecurringServiceItemPrice(
          ctx,
          {
            price: overriddenServiceItemPrice,
            specifiedDate: serviceItemSpecifiedDate,
            billableServiceId: serviceItemBillableServiceId,
            billableServiceInclusions,
            materialId,
            serviceItemId,
            serviceFrequencyId,
            businessUnitId,
            businessLineId,
            customRatesGroupId,
            forceInput,
          },
          dependencies,
        );
        let timeTaken = Date.now() - start;
        console.log(
          '🚀 aa5 ~ file: gerPrices.js:66 ~  ~ calculateRecurringServiceItemPrice:🚀',
          timeTaken,
        );
        const lineItemPricesPromise =
          lineItems &&
          Promise.all(
            lineItems.map(
              async ({
                price: overriddenLineItemPrice,
                effectiveDate: lineItemEffectiveDate,
                lineItemId,
                billableLineItemId,
              }) => {
                const lineItemSpecifiedDate = maxDate([
                  startDate ?? today,
                  lineItemEffectiveDate ?? today,
                  today,
                ]);
                console.log(
                  '🚀 aa6 ~ file: getPrices.js:85 ~  ~ starting timer for calculateRecurringLineItemPrice:🚀',
                );
                start = Date.now();
                const {
                  price: lineItemPrice,
                  globalRatesRecurringLineItemsBillingCycleId = null,
                  customRatesGroupRecurringLineItemBillingCycleId = null,
                } = await calculateRecurringLineItemPrice(
                  ctx,
                  {
                    price: overriddenLineItemPrice,
                    specifiedDate: lineItemSpecifiedDate,
                    lineItemId,
                    billableLineItemId,
                    billingCycle,
                    businessUnitId,
                    businessLineId,
                    customRatesGroupId,
                    forceInput,
                  },
                  dependencies,
                );

                timeTaken = Date.now() - start;
                console.log(
                  '🚀 aa6 ~ file: getPrices.js:110 ~  ~ calculateRecurringLineItemPrice:🚀',
                  timeTaken,
                );

                return {
                  price: lineItemPrice,
                  globalRatesRecurringLineItemsBillingCycleId,
                  customRatesGroupRecurringLineItemBillingCycleId,
                };
              },
            ),
          );

        const subscriptionOrderPricesPromise =
          subscriptionOrders &&
          Promise.all(
            subscriptionOrders.map(
              async ({
                price: overriddenSubscriptionOrderPrice,
                billableServiceId: subscriptionOrderBillableServiceId,
                subscriptionOrderId,
                serviceDate,
                ...data
              }) => {
                if (data.globalRatesServicesId && serviceDate) {
                  console.log(
                    '🚀 aa7 ~ file: getPrices.js:136 ~  ~ starting timer for GlobalRatesServiceRepository.getHistoricalInstance:🚀',
                  );
                  start = Date.now();
                  const globalRatesServices =
                    await GlobalRatesServiceRepository.getHistoricalInstance(ctx.state).getBy({
                      condition: { id: data.globalRatesServicesId },
                    });
                  timeTaken = Date.now() - start;
                  console.log(
                    '🚀 aa7 ~ file: getPrices.js:145 ~  ~ GlobalRatesServiceRepository.getHistoricalInstance:🚀',
                    timeTaken,
                  );
                  overriddenSubscriptionOrderPrice = globalRatesServices.price || 0;
                }
                const subscriptionOrderServiceSpecifiedDate = maxDate([
                  startDate ?? today,
                  serviceDate ?? today,
                  today,
                ]);
                console.log(
                  '🚀 aa8 ~ file: getPrices.js:156 ~  ~ starting timer for calculateSubscriptionOrderPrice:🚀',
                );
                start = Date.now();
                const {
                  price: subscriptionOrderServicePrice,
                  customRatesGroupServicesId: subscriptionOrderCustomRatesGroupServicesId = null,
                  globalRatesServicesId = null,
                } = await calculateSubscriptionOrderPrice(
                  ctx,
                  {
                    price: overriddenSubscriptionOrderPrice,
                    specifiedDate: subscriptionOrderServiceSpecifiedDate,
                    billableServiceId: subscriptionOrderBillableServiceId,
                    parentBillableServiceId: serviceItemBillableServiceId,
                    billableServiceInclusions,
                    subscriptionOrderId,
                    businessUnitId,
                    businessLineId,
                    customRatesGroupId,
                    materialId,
                    forceInput,
                  },
                  dependencies,
                );
                timeTaken = Date.now() - start;
                console.log(
                  '🚀 aa8 ~ file: getPrices.js:182 ~  ~ calculateSubscriptionOrderPrice:🚀',
                  timeTaken,
                );

                return {
                  price: subscriptionOrderServicePrice,
                  customRatesGroupServicesId: subscriptionOrderCustomRatesGroupServicesId,
                  globalRatesServicesId,
                };
              },
            ),
          );

        console.log('🚀 aa9 ~ file: getPrices.js:196 ~  ~ starting timer for await Promise.all:🚀');
        start = Date.now();

        const [lineItemPrices, subscriptionOrderPrices] = await Promise.all([
          lineItemPricesPromise,
          subscriptionOrderPricesPromise,
        ]);

        timeTaken = Date.now() - start;
        console.log('🚀 aa9 ~ file: getPrices.js:207 ~  ~ await Promise.all:🚀', timeTaken);

        return {
          materialId,
          price: serviceItemPrice,
          lineItems: lineItemPrices,
          subscriptionOrders: subscriptionOrderPrices,
          globalRatesRecurringServicesId,
          customRatesGroupServicesId,
        };
      },
    ),
  );

  return prices;
};

export default getPrices;
