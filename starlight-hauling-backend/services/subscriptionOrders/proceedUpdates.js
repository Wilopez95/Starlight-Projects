import omit from 'lodash/fp/omit.js';

import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';

import { proceedSubscriptionServiceItems } from '../subscriptionServiceItems/proceedSubscriptionServiceItems.js';
import { initSubscriptionDates } from '../subscriptions/utils/initSubscriptionDates.js';
import { getServiceAndLineItemIds } from '../subscriptions/getServiceAndLineItemHistoricalIds.js';

import { mapUpdateEvents } from '../../utils/updateEvents.js';
import { pricingGetSubscriptionServiceItemById } from '../pricing.js';
import GlobalRatesServiceRepository from '../../repos/globalRatesService.js';
import CustomRatesGroupServiceRepository from '../../repos/customRatesGroupService.js';
import BillableServiceRepository from '../../repos/billableService.js';
import { updateBasedOnSnapshot } from './updateBasedOnSnapshot.js';

export const proceedUpdates = async (
  ctx,
  {
    subscription,
    data,
    availableCredit,
    overrideCreditLimit,
    // pre-pricing service code:
    // subsRepo,
    // end of pre-pricing service code
    oneTimeSubscriptionOrdersUpdates = {},
  },
  trx,
) => {
  const deletedWorkOrders = [];
  const oneTimeWosTemplates = [];
  if (!data?.length) {
    return {
      deletedWorkOrders,
      oneTimeWosTemplates,
    };
  }
  const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);

  const {
    add: addSubscriptionOrders,
    edit: editSubscriptionOrders,
    remove: removeSubscriptionOrders,
  } = mapUpdateEvents(data);

  if (removeSubscriptionOrders?.length) {
    oneTimeSubscriptionOrdersUpdates.removeSubscriptionOrders = removeSubscriptionOrders;

    const today = new Date();
    await Promise.all(
      removeSubscriptionOrders.map(({ id }) =>
        updateBasedOnSnapshot(
          ctx,
          {
            subscription,
            id,
            deletedWorkOrders,
            deletedAt: today,
          },
          trx,
        ),
      ),
    );
  }

  if (editSubscriptionOrders?.length) {
    oneTimeSubscriptionOrdersUpdates.editSubscriptionOrders = editSubscriptionOrders;

    await Promise.all(
      editSubscriptionOrders.map(({ id, eventType, unlockOverrides, ...updates }) =>
        updateBasedOnSnapshot(
          ctx,
          {
            subscription,
            id,
            unlockOverrides,
            availableCredit,
            overrideCreditLimit,
            deletedWorkOrders,
            ...updates,
          },
          trx,
        ),
      ),
    );
  }

  if (addSubscriptionOrders?.length) {
    oneTimeSubscriptionOrdersUpdates.addSubscriptionOrders = addSubscriptionOrders;

    // pre-pricing service code:
    // const serviceItemsIds = data.map(item => item.subscriptionServiceItemId);
    // const serviceItems = await subsServiceItemRepo.getBySubscriptionId(
    //   {
    //     subscriptionId: subscription.id,
    //     ids: serviceItemsIds,
    //     excludeEnded: false,
    //   },
    //   trx,
    // );
    // end of pre-pricing service code
    const serviceItems = await pricingGetSubscriptionServiceItemById(ctx, {
      data: { id: subscription.id },
    });
    // end of post-pricing service code

    let { serviceItems: serviceItemsInput } = await getServiceAndLineItemIds({
      serviceItems,
      skipQuerying: true,
    });

    const subscriptionOrders = await Promise.all(
      addSubscriptionOrders.map(async item => {
        // pre-pricing service code:
        // const updatedItem = await subsOrdersRepo.getLinkedHistoricalIds(
        //   pick(['globalRatesServicesId', 'customRatesGroupServicesId', 'billableServiceId'])(item),
        //   { entityRepo: subsRepo },
        //   trx,
        // );
        // end of pre-pricing service code
        const updatedItem = {};

        if (item.globalRatesServicesId) {
          const globalRatesServices = await GlobalRatesServiceRepository.getHistoricalInstance(
            ctx.state,
          ).getBy({
            condition: { id: item.globalRatesServicesId },
          });
          updatedItem.globalRatesServices = globalRatesServices;
        }

        if (item.customRatesGroupServicesId) {
          const customRatesGroupServices =
            await CustomRatesGroupServiceRepository.getHistoricalInstance(ctx.state).getBy({
              condition: { id: item.customRatesGroupServicesId },
            });
          updatedItem.customRatesGroupServices = customRatesGroupServices;
        }

        const billableService = await BillableServiceRepository.getHistoricalInstance(
          ctx.state,
        ).getBy({
          condition: { id: item.billableServiceId },
        });
        updatedItem.billableService = billableService;
        // end of post-pricing service code

        return {
          ...omit(['eventType'])(item),
          ...updatedItem,
          overrideCreditLimit,
        };
      }),
    );

    serviceItemsInput = serviceItemsInput.map(serviceItem => ({
      ...serviceItem,
      subscriptionOrders,
    }));

    const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
      await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);

    const { today, tomorrow, subscriptionEndDate } = initSubscriptionDates(subscription);

    const { subscriptionOneTimeWorkOrdersTemplates } = await proceedSubscriptionServiceItems(
      ctx,
      {
        serviceItemsInput,
        subscription,
        firstOrderDate: today,
        subscriptionEndDate,
        today,
        tomorrow,
        subscriptionBillableServicesMap,
        oneTimeBillableServicesMap,
        skipInsertServiceItems: true,
        proceedSubsOrders: true,
      },
      trx,
    );

    if (subscriptionOneTimeWorkOrdersTemplates?.length) {
      oneTimeWosTemplates.push(...subscriptionOneTimeWorkOrdersTemplates);
    }
  }

  return { oneTimeWosTemplates, deletedWorkOrders };
};
