import omit from 'lodash/fp/omit.js';
import { addDays, isBefore } from 'date-fns';
import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import RecurringServicesGlobalRatesRepo from '../../repos/globalRateRecurringServiceFrequency.js';
import RecurringServicesCustomRatesRepo from '../../repos/customRatesGroupRecurringServiceFrequency.js';
import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import BillableServiceRepo from '../../repos/billableService.js';
import calculateRecurringServiceItemPrice from '../pricesCalculation/subscription/prices/recurringServiceItemPrice.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { ACTION } from '../../consts/actions.js';
import { pricingAlterSubscriptionServiceItem } from '../pricing.js';

export const updateBasedOnSnapshot = async (
  ctx,
  { subscription, id, effectiveDate, unlockOverrides, customRatesGroupId, ...updates },
  trx,
) => {
  ctx.logger.debug(`subsServiceItemService->updateBasedOnSnapshot->id: ${id}`);
  ctx.logger.debug(
    `subsServiceItemService->updateBasedOnSnapshot->effectiveDate: ${effectiveDate}`,
  );
  ctx.logger.debug(subscription, 'subsServiceItemService->updateBasedOnSnapshot->subscription');
  ctx.logger.debug(updates, 'subsServiceItemService->updateBasedOnSnapshot->updates');

  const serviceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);
  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 26/09/2022
  const serviceItem = await serviceItemRepo.getItemBySpecificDate({
    serviceItemId: id,
    specifiedDate: isBefore(new Date(effectiveDate), new Date(subscription.startDate))
      ? subscription.startDate
      : effectiveDate,
    withOriginalIds: true,
  });
  ctx.logger.debug(serviceItem, 'subsServiceItemService->updateBasedOnSnapshot->serviceItem');
  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 26/09/2022
  const nextServiceItem = await serviceItemRepo.getNextItemBySpecificDate({
    serviceItemId: id,
    specifiedDate: new Date(),
  });
  let nextPrice = null;
  // not null, not undefined
  if (
    updates.price != null &&
    (!nextServiceItem?.effectiveDate ||
      isBefore(new Date(effectiveDate), new Date(nextServiceItem.effectiveDate)))
  ) {
    nextPrice = updates.price;
    // not null, not undefined
  } else if (nextServiceItem && nextServiceItem.price != null) {
    nextPrice = nextServiceItem.price;
  }
  ctx.logger.debug(`subsServiceItemService->updateBasedOnSnapshot->nextPrice: ${nextPrice}`);

  const updatedServiceItem = {
    ...omit([
      'id',
      'originalId',
      'eventType',
      'userId',
      'traceId',
      'createdAt',
      'updatedAt',
      'billableServiceOriginalId',
      'materialOriginalId',
      'globalRatesRecurringServicesOriginalId',
      'customRatesGroupOriginalId',
      'customRatesGroupServicesOriginalId',
      'customRatesGroupServicesOriginalId',
      'frequencyTimes',
      'frequencyType',
    ])(serviceItem),
    ...updates,
    nextPrice,
    effectiveDate,
    unlockOverrides,
  };
  if (!unlockOverrides) {
    const calcParams = {
      specifiedDate: effectiveDate,
      serviceItemId: id,
      businessUnitId: subscription.businessUnitId,
      businessLineId: subscription.businessLineId,
      billingCycle: subscription.billingCycle,
      price: updates.price,
    };
    if (updates.billableServiceId && updates.billableServiceId !== serviceItem.billableServiceId) {
      calcParams.billableServiceId = updates.billableServiceId;
      calcParams.forceInput = true;
    } else {
      calcParams.billableServiceId = serviceItem.billableServiceId;
    }
    if (updates.materialId && updates.materialId !== serviceItem.materialId) {
      calcParams.materialId = updates.materialId || null;
      calcParams.forceInput = true;
    } else {
      calcParams.materialId = serviceItem.materialId;
    }
    if (
      updates.serviceFrequencyId &&
      updates.serviceFrequencyId !== serviceItem.serviceFrequencyId
    ) {
      calcParams.serviceFrequencyId = updates.serviceFrequencyId || null;
      calcParams.forceInput = true;
    } else {
      calcParams.serviceFrequencyId = serviceItem.serviceFrequencyId;
    }
    if (
      updates.globalRatesRecurringServicesId &&
      updates.globalRatesRecurringServicesId !== serviceItem.globalRatesRecurringServicesId
    ) {
      calcParams.customRatesGroupId =
        customRatesGroupId || serviceItem.customRatesGroupOriginalId || null;
      calcParams.forceInput = true;
    }
    if (
      updates.customRatesGroupServicesId &&
      updates.customRatesGroupServicesId !== serviceItem.customRatesGroupServicesId
    ) {
      calcParams.customRatesGroupId =
        customRatesGroupId || serviceItem.customRatesGroupOriginalId || null;
      calcParams.forceInput = true;
    }
    ctx.logger.debug(calcParams, 'subsServiceItemService->updateBasedOnSnapshot->calcParams');
    const rate = await calculateRecurringServiceItemPrice(
      { state: ctx.state, logger: ctx.logger },
      calcParams,
      {
        SubscriptionServiceItemRepo,
        RecurringServicesCustomRatesRepo,
        RecurringServicesGlobalRatesRepo,
      },
    );
    ctx.logger.debug(rate, 'subsServiceItemService->updateBasedOnSnapshot->rate');
    updatedServiceItem.price = rate.price;
    updatedServiceItem.globalRatesRecurringServicesId = rate.globalRatesRecurringServicesId || null;
    updatedServiceItem.customRatesGroupServicesId = rate.customRatesGroupServicesId || null;
  }
  ctx.logger.debug(
    updatedServiceItem,
    'subsServiceItemService->updateBasedOnSnapshot->updatedServiceItem',
  );
  await serviceItemRepo.updateBy(
    {
      condition: { id },
      data: updatedServiceItem,
    },
    trx,
  );
  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 26/09/2022

  await pricingAlterSubscriptionServiceItem(ctx, { data: updatedServiceItem }, id);

  const subsOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);
  if (updates.isDeleted) {
    await subsOrderRepo.cleanOrders(
      {
        subscriptionIds: [updatedServiceItem.subscriptionId],
        subscriptionServiceItemsIds: [id],
        statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
        excludeTypes: [ACTION.final],
        // last orders can be on the last day of service
        effectiveDate: addDays(effectiveDate, 1),
      },
      trx,
    );
  } else {
    // TODO: not re-generate here if only text fields changed
    //  (align with subs repo)
    // if (changesAreCritical(serviceItem, updatedServiceItem)) {
    const billableService = await BillableServiceRepo.getHistoricalInstance(ctx.state).getById({
      id: updatedServiceItem.billableServiceId,
    });

    if (billableService.action === ACTION.service) {
      await subsOrderRepo.cleanOrders(
        {
          subscriptionIds: [updatedServiceItem.subscriptionId],
          subscriptionServiceItemsIds: [id],
          statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
          // clean-up and re-generate only servicing orders
          types: [ACTION.service],
          effectiveDate,
        },
        trx,
      );
    }
    // }
    // TODO: propagate changes to Subs Orders
  }
};
