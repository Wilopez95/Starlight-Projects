import isEmpty from 'lodash/isEmpty.js';
// pre-pricing service code:
// import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';

// import { serviceItemFieldsForGeneration } from '../../consts/subscriptionServiceItems.js';
import {
  pricingBulkAddSubscriptionServiceItem,
  // pricingDeleteSubscriptionServiceItem,
} from '../pricing.js';
import { proccedOneTimeSubOrders } from './proccedOneTimeSubOrders.js';
import { proceedSubscriptionServiceItem } from './proceedSubscriptionServiceItem.js';
import { setServiceItemsMap } from './utils/setServiceItemsMap.js';

export const proceedSubscriptionServiceItems = async (
  ctx,
  {
    serviceItemsInput,
    subscription,
    firstOrderDate,
    subscriptionEndDate,
    today,
    tomorrow,
    subscriptionBillableServicesMap,
    oneTimeBillableServicesMap,
    originalIdsMap,
    skipInsertServiceItems = false,
    useEffectiveDate = false,
    proceedSubsOrders = false,
    skipOneTime = false,
  },
  trx,
) => {
  const serviceItemsPreparedInput = [];
  const serviceLineItemsInputMap = {};
  const subscriptionOrdersInputMap = {};
  const serviceItemsFrequenciesMap = {};

  const serviceLineItemsPreparedInput = [];
  const subsOneTimeOrdersPreparedInput = [];

  const subsRecurringOrdersTemplates = [];
  const subsOneTimeWorkOrdersTemplates = [];
  const oneTimeOrdersSequenceIds = [];
  const oneTimeOrdersIds = [];
  let serviceItems = [];

  if (!isEmpty(serviceItemsInput)) {
    // const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);

    // Remove line items and subscription orders - store results in serviceItemsPrepared
    await setServiceItemsMap(
      ctx.state,
      {
        skipOneTime,
        serviceItemsInput,
        subscriptionId: subscription.id,
        serviceItemsFrequenciesMap,
        serviceLineItemsInputMap,
        subscriptionOrdersInputMap,
        serviceItemsPreparedInput,
      },
      trx,
    );

    serviceItems = serviceItemsInput;
    if (!skipInsertServiceItems) {
      // This is the origil code created by Eleks
      // serviceItems = await subsServiceItemRepo.insertMany(
      //   {
      //     data: serviceItemsPreparedInput,
      //     fields: serviceItemFieldsForGeneration,
      //   },
      //   trx,
      // );

      // I commented this delete logic out for now - AT 2/8/23
      /*await pricingDeleteSubscriptionServiceItem(ctx, {
        data: { subscriptionId: subscription.id },
      });*/

      serviceItems = await pricingBulkAddSubscriptionServiceItem(ctx, {
        data: {
          data: serviceItemsPreparedInput,
        },
      });
    }

    ctx.logger.debug(serviceItems, 'subsServiceRepo->proceedSubsServiceItems->serviceItems');

    serviceItems.forEach(
      proceedSubscriptionServiceItem(ctx.state, {
        subscription,
        firstOrderDate,
        subscriptionEndDate,
        today,
        tomorrow,
        serviceItemsFrequenciesMap,
        subscriptionOrdersInputMap,
        subscriptionBillableServicesMap,
        oneTimeBillableServicesMap,
        originalIdsMap,
        serviceLineItemsInputMap,
        subsOneTimeOrdersPreparedInput,
        subsRecurringOrdersTemplates,
        serviceLineItemsPreparedInput,
        skipInsertServiceItems,
        useEffectiveDate,
      }),
    );
    if (!skipInsertServiceItems || proceedSubsOrders) {
      const templates = await proccedOneTimeSubOrders(
        ctx,
        ctx.state,
        {
          serviceLineItemsPreparedInput,
          subsOneTimeOrdersPreparedInput,
          proceedSubsOrders,
          oneTimeOrdersIds,
          oneTimeOrdersSequenceIds,
          subscription,
        },
        trx,
      );
      if (!isEmpty(templates)) {
        subsOneTimeWorkOrdersTemplates.push(...templates);
      }
    }
  }

  return {
    subscriptionRecurringOrdersTemplates: subsRecurringOrdersTemplates,
    subscriptionOneTimeWorkOrdersTemplates: subsOneTimeWorkOrdersTemplates,
    oneTimeOrdersIds,
    oneTimeOrdersSequenceIds,
    serviceItems,
  };
};
