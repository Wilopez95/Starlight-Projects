import { pricingGetLineItems } from '../../../pricing.js';

const calculateRecurringLineItemPrice = async (
  ctx,
  {
    price: overriddenPrice,
    lineItemId,
    billableLineItemId,
    billingCycle,
    specifiedDate,
    businessUnitId,
    businessLineId,
    customRatesGroupId = null,
    forceInput = false,
  },
  // pre-pricing service code:
  // {
  //   SubscriptionLineItemRepo,
  //   RecurringLineItemsCustomRatesRepo,
  //   RecurringLineItemsGlobalRatesRepo,
  // },
  { RecurringLineItemsCustomRatesRepo, RecurringLineItemsGlobalRatesRepo },
) => {
  ctx.logger.debug(
    {
      overriddenPrice,
      lineItemId,
      billableLineItemId,
      billingCycle,
      specifiedDate,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      forceInput,
    },
    `subsLineItemService->calculateRecurringLineItemPrice->params`,
  );
  // At specified Date these fields can differ from input
  let recurringLineItemGlobalRateIdForDate;
  let recurringLineItemCustomRateIdForDate;
  let customRatesGroupIdForDate;
  let billableLineItemIdForDate;
  let billingCycleForDate;
  let prevQuantity;
  let prevProrationEffectiveDate;
  let prevProrationEffectivePrice;
  let prevProrationOverride;

  if (lineItemId) {
    console.log(
      '🚀 aa13 ~ file: recurringLineItemPrice.js:51 ~  ~ starting timer for pricingGetLineItems ****Pricing Request****:🚀',
    );
    const start = Date.now();
    const {
      unlockOverrides,
      price,
      quantity,
      prorationEffectiveDate,
      prorationEffectivePrice,
      prorationOverride,
      // At specified Date these fields can differ from input
      globalRatesRecurringLineItemsBillingCycleId,
      customRatesGroupRecurringLineItemBillingCycleId,
      customRatesGroupOriginalId: currentCustomRatesGroupId,
      billableLineItemId: currentBillableLineItemId,
      billingCycle: currentBillingCycle,
    } = (await pricingGetLineItems(ctx, { data: { id: lineItemId } })) ?? {};

    const timeTaken = Date.now() - start;
    console.log(
      '🚀 aa13 ~ file: recurringLineItemPrice.js:71 ~  ~ pricingGetLineItems: ****Pricing Request****🚀',
      timeTaken,
    );

    prevQuantity = quantity;
    prevProrationEffectiveDate = prorationEffectiveDate;
    prevProrationEffectivePrice = prorationEffectivePrice;
    prevProrationOverride = prorationOverride;

    if (unlockOverrides) {
      return {
        price: Number(overriddenPrice ?? price),
        prevQuantity,
        prevProrationEffectiveDate,
        prevProrationEffectivePrice,
        prevProrationOverride,
        globalRatesRecurringLineItemsBillingCycleId,
        customRatesGroupRecurringLineItemBillingCycleId,
      };
    }

    recurringLineItemGlobalRateIdForDate = globalRatesRecurringLineItemsBillingCycleId || null;
    recurringLineItemCustomRateIdForDate = customRatesGroupRecurringLineItemBillingCycleId || null;
    customRatesGroupIdForDate = currentCustomRatesGroupId || null;
    billableLineItemIdForDate = currentBillableLineItemId;
    billingCycleForDate = currentBillingCycle;
  }
  ctx.logger.debug(
    `subsLineItemService->calculateRecurringLineItemPrice->recurringLineItemGlobalRateIdForDate: ${recurringLineItemGlobalRateIdForDate}`,
  );
  ctx.logger.debug(
    `subsLineItemService->calculateRecurringLineItemPrice->recurringLineItemCustomRateIdForDate: ${recurringLineItemCustomRateIdForDate}`,
  );
  ctx.logger.debug(
    `subsLineItemService->calculateRecurringLineItemPrice->customRatesGroupIdForDate: ${customRatesGroupIdForDate}`,
  );
  ctx.logger.debug(
    `subsLineItemService->calculateRecurringLineItemPrice->billableLineItemIdForDate: ${billableLineItemIdForDate}`,
  );
  ctx.logger.debug(
    `subsLineItemService->calculateRecurringLineItemPrice->billingCycleForDate: ${billingCycleForDate}`,
  );

  if (
    recurringLineItemCustomRateIdForDate ||
    (!lineItemId && customRatesGroupId) ||
    (forceInput && customRatesGroupId)
  ) {
    console.log(
      '🚀 aa14 ~ file: recurringLineItemPrice.js:120 ~  ~ starting timer for RecurringLineItemsCustomRatesRepo.getHistoricalInstance:🚀',
    );
    const start = Date.now();
    const { price = 0, customRatesGroupRecurringLineItemBillingCycleId } =
      (await RecurringLineItemsCustomRatesRepo.getHistoricalInstance(
        ctx.state,
      ).getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        customRatesGroupId:
          !forceInput && recurringLineItemCustomRateIdForDate
            ? customRatesGroupIdForDate
            : customRatesGroupId,
        billableLineItemId:
          !forceInput && billableLineItemIdForDate ? billableLineItemIdForDate : billableLineItemId,
        billingCycle: !forceInput && billingCycleForDate ? billingCycleForDate : billingCycle,
      })) ?? {};
    const timeTaken = Date.now() - start;
    console.log(
      '🚀 aa14 ~ file: recurringLineItemPrice.js:140 ~  ~ RecurringLineItemsCustomRatesRepo.getHistoricalInstance:🚀',
      timeTaken,
    );

    return {
      price: Number(overriddenPrice ?? price),
      customRatesGroupRecurringLineItemBillingCycleId,
      prevQuantity,
      prevProrationEffectiveDate,
      prevProrationEffectivePrice,
      prevProrationOverride,
    };
  }
  console.log(
    '🚀 aa15 ~ file: recurringLineItemPrice.js:154 ~  ~ starting timer for RecurringLineItemsGlobalRatesRepo.getHistoricalInstance:🚀',
  );
  const start = Date.now();
  const { price = 0, globalRatesRecurringLineItemsBillingCycleId } =
    (await RecurringLineItemsGlobalRatesRepo.getHistoricalInstance(ctx.state).getRateBySpecificDate(
      {
        specifiedDate,
        businessUnitId,
        businessLineId,
        billableLineItemId:
          !forceInput && billableLineItemIdForDate ? billableLineItemIdForDate : billableLineItemId,
        billingCycle: !forceInput && billingCycleForDate ? billingCycleForDate : billingCycle,
      },
    )) ?? {};
  const timeTaken = Date.now() - start;
  console.log(
    '🚀 aa15 ~ file: recurringLineItemPrice.js:170 ~  ~ RecurringLineItemsGlobalRatesRepo.getHistoricalInstance:🚀',
    timeTaken,
  );

  return {
    price: Number(overriddenPrice ?? price),
    globalRatesRecurringLineItemsBillingCycleId,
    prevQuantity,
    prevProrationEffectiveDate,
    prevProrationEffectivePrice,
    prevProrationOverride,
  };
};

export default calculateRecurringLineItemPrice;
