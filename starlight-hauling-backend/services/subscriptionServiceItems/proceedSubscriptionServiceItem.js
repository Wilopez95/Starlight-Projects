import { ensureDelivery } from '../subscriptionOrders/utils/ensureDelivery.js';
import { ensureFinal } from '../subscriptionOrders/utils/ensureFinal.js';
import { proceedOneTimeSubscriptionOrders } from '../subscriptionOrders/proceedOneTimeSubscriptionOrders.js';
import { proceedRecurringSubscriptionOrders } from '../subscriptionOrders/proceedRecurringSubscriptionOrders.js';
import { validateServiceItemInput } from './utils/validateServiceItemInput.js';

export const proceedSubscriptionServiceItem =
  (
    ctxState,
    {
      subscription,
      firstOrderDate,
      subscriptionEndDate,
      today,
      tomorrow,
      serviceItemsFrequenciesMap,
      subscriptionOrdersInputMap,
      subscriptionBillableServicesMap,
      oneTimeBillableServicesMap,
      serviceLineItemsInputMap,
      originalIdsMap,
      subsOneTimeOrdersPreparedInput,
      subsRecurringOrdersTemplates,
      serviceLineItemsPreparedInput,
      skipInsertServiceItems = false,
      useEffectiveDate = false,
    },
  ) =>
  // pre-pricing service code:
  // (serviceItem, idx) => {
  //   const subscriptionService = subscriptionBillableServicesMap[serviceItem.billableServiceId];
  //   ctxState.logger.debug(
  //     subscriptionService,
  //     'subsServiceRepo->proceedSubsService->subscriptionService',
  //   );

  //   validateServiceItemInput(
  //     serviceItem,
  //     subscriptionService,
  //     skipInsertServiceItems,
  //     subscriptionBillableServicesMap,
  //   );

  //   const { deliveryDate } = ensureDelivery(ctxState, {
  //     subscription,
  //     idx,
  //     firstOrderDate: (useEffectiveDate && serviceItem.effectiveDate) || firstOrderDate,
  //     today,
  //     subscriptionService,
  //     subscriptionOrdersInputMap,
  //     oneTimeBillableServicesMap,
  //     originalIdsMap,
  //   });
  //   ctxState.logger.debug(
  //     `subsServiceRepo->proceedSubsService->deliveryDate: ${deliveryDate?.toISOString()}`,
  //   );

  //   const { finalDate } = ensureFinal(ctxState, {
  //     subscription,
  //     idx,
  //     subscriptionEndDate,
  //     tomorrow,
  //     subscriptionService,
  //     subscriptionOrdersInputMap,
  //     oneTimeBillableServicesMap,
  //     originalIdsMap,
  //   });
  //   ctxState.logger.debug(
  //     `subsServiceRepo->proceedSubsService->finalDate: ${finalDate?.toISOString()}`,
  //   );

  //   if (serviceLineItemsInputMap[idx]) {
  //     serviceLineItemsPreparedInput.push(
  //       ...serviceLineItemsInputMap[idx].map(item => ({
  //         ...item,
  //         subscriptionServiceItemId: serviceItem.id,
  //       })),
  // end pre-pricing service code
  (serviceItem, idx) => {
    const subscriptionService = subscriptionBillableServicesMap[serviceItem.billableServiceId];
    ctxState.logger.debug(
      subscriptionService,
      'subsServiceRepo->proceedSubsService->subscriptionService',
      // end added for pricing
    );

    validateServiceItemInput(
      serviceItem,
      subscriptionService,
      skipInsertServiceItems,
      subscriptionBillableServicesMap,
    );

    const { deliveryDate } = ensureDelivery(ctxState, {
      subscription,
      idx,
      firstOrderDate: (useEffectiveDate && serviceItem.effectiveDate) || firstOrderDate,
      today,
      subscriptionService,
      subscriptionOrdersInputMap,
      oneTimeBillableServicesMap,
      originalIdsMap,
    });
    ctxState.logger.debug(
      `subsServiceRepo->proceedSubsService->deliveryDate: ${deliveryDate?.toISOString()}`,
    );

    const { finalDate } = ensureFinal(ctxState, {
      subscription,
      idx,
      subscriptionEndDate,
      tomorrow,
      subscriptionService,
      subscriptionOrdersInputMap,
      oneTimeBillableServicesMap,
      originalIdsMap,
    });
    ctxState.logger.debug(
      `subsServiceRepo->proceedSubsService->finalDate: ${finalDate?.toISOString()}`,
    );

    if (serviceLineItemsInputMap[idx]) {
      serviceLineItemsPreparedInput.push(
        ...serviceLineItemsInputMap[idx].map(item => ({
          ...item,
          subscriptionServiceItemId: serviceItem.id,
        })),
      );
    }

    const oneTimeOrdersInput = proceedOneTimeSubscriptionOrders({
      subscription,
      serviceItem,
      idx,
      today,
      subscriptionOrdersInputMap,
      oneTimeBillableServicesMap,
    });

    if (oneTimeOrdersInput.length) {
      subsOneTimeOrdersPreparedInput.push(...oneTimeOrdersInput);
    }

    const subsRecurringOrdersTemplate = proceedRecurringSubscriptionOrders({
      frequency: serviceItemsFrequenciesMap[serviceItem.serviceFrequencyId],
      subscription,
      serviceItem,
      subscriptionService,
      deliveryDate,
      finalDate,
      useEffectiveDate,
    });

    if (subsRecurringOrdersTemplate) {
      subsRecurringOrdersTemplates.push(...subsRecurringOrdersTemplate);
    }
  };
