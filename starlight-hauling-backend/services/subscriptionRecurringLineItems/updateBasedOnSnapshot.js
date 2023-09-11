import omit from 'lodash/fp/omit.js';
import { isBefore } from 'date-fns';

import SubscriptionLineItemRepo from '../../repos/subscriptionLineItem.js';
import RecurringLineItemsGlobalRatesRepo from '../../repos/globalRateRecurringLineItemBillingCycle.js';
import RecurringLineItemsCustomRatesRepo from '../../repos/customRatesGroupRecurringLineItemBillingCycle.js';
import calculateRecurringLineItemPrice from '../pricesCalculation/subscription/prices/recurringLineItemPrice.js';
import { pricingAlterSubscriptionLineItem } from '../pricing.js';

export const updateBasedOnSnapshot = async (
  ctx,
  { subscription, id, effectiveDate, unlockOverrides, customRatesGroupId, ...updates },
) => {
  ctx.logger.debug(`subsLineItemService->updateBasedOnSnapshot->id: ${id}`);
  ctx.logger.debug(`subsLineItemService->updateBasedOnSnapshot->effectiveDate: ${effectiveDate}`);
  ctx.logger.debug(subscription, 'subsLineItemService->updateBasedOnSnapshot->subscription');
  ctx.logger.debug(updates, 'subsLineItemService->updateBasedOnSnapshot->updates');

  const lineItemRepo = SubscriptionLineItemRepo.getInstance(ctx.state);

  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 28/09/2022
  const lineItem = await lineItemRepo.getItemBySpecificDate({
    lineItemId: id,
    specifiedDate: isBefore(effectiveDate, subscription.startDate)
      ? subscription.startDate
      : effectiveDate,
    withOriginalIds: true,
  });
  ctx.logger.debug(lineItem, 'subsLineItemService->updateBasedOnSnapshot->lineItem');

  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 28/09/2022
  const nextLineItem = await lineItemRepo.getNextItemBySpecificDate({
    lineItemId: id,
    specifiedDate: new Date(),
  });
  let nextPrice = null;
  // not null, not undefined
  if (
    updates.price != null &&
    (!nextLineItem?.effectiveDate || isBefore(effectiveDate, nextLineItem.effectiveDate))
  ) {
    nextPrice = updates.price;
    // not null, not undefined
  } else if (nextLineItem && nextLineItem.price != null) {
    nextPrice = nextLineItem.price;
  }
  ctx.logger.debug(`subsLineItemService->updateBasedOnSnapshot->nextPrice: ${nextPrice}`);

  const updatedLineItem = {
    ...omit([
      'id',
      'originalId',
      'eventType',
      'userId',
      'traceId',
      'createdAt',
      'updatedAt',
      'customRatesGroupOriginalId',
      'billingCycle',
      'billableLineItemOriginalId',
    ])(lineItem),
    ...updates,
    nextPrice,
    effectiveDate,
    unlockOverrides,
  };
  if (!unlockOverrides) {
    const calcParams = {
      specifiedDate: effectiveDate,
      lineItemId: id,
      businessUnitId: subscription.businessUnitId,
      businessLineId: subscription.businessLineId,
      billingCycle: subscription.billingCycle,
      price: updates.price,
    };
    if (updates.billableLineItemId && updates.billableLineItemId !== lineItem.billableLineItemId) {
      calcParams.billableLineItemId = updates.billableLineItemId;
      calcParams.forceInput = true;
    } else {
      calcParams.billableLineItemId = lineItem.billableLineItemId;
    }
    if (updates.materialId && updates.materialId !== lineItem.materialId) {
      calcParams.materialId = updates.materialId || null;
      calcParams.forceInput = true;
    } else {
      calcParams.materialId = lineItem.materialId;
    }
    if (
      updates.globalRatesRecurringLineItemsBillingCycleId &&
      updates.globalRatesRecurringLineItemsBillingCycleId !==
        lineItem.globalRatesRecurringLineItemsBillingCycleId
    ) {
      calcParams.customRatesGroupId =
        customRatesGroupId || lineItem.customRatesGroupOriginalId || null;
      calcParams.forceInput = true;
    }
    if (
      updates.customRatesGroupRecurringLineItemBillingCycleId &&
      updates.customRatesGroupRecurringLineItemBillingCycleId !==
        lineItem.customRatesGroupRecurringLineItemBillingCycleId
    ) {
      calcParams.customRatesGroupId =
        customRatesGroupId || lineItem.customRatesGroupOriginalId || null;
      calcParams.forceInput = true;
    }
    ctx.logger.debug(calcParams, 'subsLineItemService->updateBasedOnSnapshot->calcParams');
    const rate = await calculateRecurringLineItemPrice(
      { state: ctx.state, logger: ctx.logger },
      calcParams,
      {
        SubscriptionLineItemRepo,
        RecurringLineItemsCustomRatesRepo,
        RecurringLineItemsGlobalRatesRepo,
      },
    );
    ctx.logger.debug(rate, 'subsLineItemService->updateBasedOnSnapshot->rate');
    updatedLineItem.price = rate.price;
    updatedLineItem.globalRatesRecurringLineItemsBillingCycleId =
      rate.globalRatesRecurringLineItemsBillingCycleId || null;
    updatedLineItem.customRatesGroupRecurringLineItemBillingCycleId =
      rate.customRatesGroupRecurringLineItemBillingCycleId || null;
  }
  ctx.logger.debug(updatedLineItem, 'subsLineItemService->updateBasedOnSnapshot->updatedLineItem');
  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 28/09/2022
  await pricingAlterSubscriptionLineItem(ctx, { data: updatedLineItem }, id);
  // await lineItemRepo.updateBy(
  //   {
  //     condition: { id },
  //     data: updatedLineItem,
  //   },
  //   trx,
  // );
};
