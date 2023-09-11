const calculateLineItemPrice = async (
  ctx,
  {
    price: overriddenPrice,
    lineItemId,
    billableLineItemId,
    specifiedDate,
    businessUnitId,
    businessLineId,
    materialId = null,
    customRatesGroupId = null,
    forceInput = false,
  },
  { SubscriptionOrderLineItemRepo, CustomRatesGroupLineItemRepo, GlobalRatesLineItemRepo },
) => {
  ctx.logger.debug(
    {
      overriddenPrice,
      lineItemId,
      billableLineItemId,
      specifiedDate,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      materialId,
      forceInput,
    },
    `subscriptionOrderLineItem->calculateLineItemPrice->params`,
  );
  // At specified Date these fields can differ from input
  let lineItemGlobalRateIdForDate;
  let lineItemCustomRateIdForDate;
  let customRatesGroupIdForDate;
  let billableLineItemIdForDate;
  let materialIdForDate;

  if (lineItemId) {
    const {
      unlockOverrides,
      price,
      // At specified Date these fields can differ from input
      globalRatesLineItemsId,
      customRatesGroupLineItemsId,
      customRatesGroupOriginalId: currentCustomRatesGroupId,
      billableLineItemId: currentBillableLineItemId,
      materialOriginalId: currentMaterialId,
    } = (await SubscriptionOrderLineItemRepo.getHistoricalInstance(ctx.state).getItemBySpecificDate(
      {
        lineItemId,
        specifiedDate,
        withOriginalIds: true,
      },
    )) ?? {};

    if (unlockOverrides) {
      return {
        price: Number(overriddenPrice ?? price),
        globalRatesLineItemsId,
        customRatesGroupLineItemsId,
      };
    }

    lineItemGlobalRateIdForDate = globalRatesLineItemsId || null;
    lineItemCustomRateIdForDate = customRatesGroupLineItemsId || null;
    customRatesGroupIdForDate = currentCustomRatesGroupId || null;
    billableLineItemIdForDate = currentBillableLineItemId;
    materialIdForDate = currentMaterialId || null;
  }
  ctx.logger.debug(
    `subscriptionOrderLineItem->calculateLineItemPrice->lineItemGlobalRateIdForDate: ${lineItemGlobalRateIdForDate}`,
  );
  ctx.logger.debug(
    `subscriptionOrderLineItem->calculateLineItemPrice->lineItemCustomRateIdForDate: ${lineItemCustomRateIdForDate}`,
  );
  ctx.logger.debug(
    `subscriptionOrderLineItem->calculateLineItemPrice->customRatesGroupIdForDate: ${customRatesGroupIdForDate}`,
  );
  ctx.logger.debug(
    `subscriptionOrderLineItem->calculateLineItemPrice->billableLineItemIdForDate: ${billableLineItemIdForDate}`,
  );
  ctx.logger.debug(
    `subscriptionOrderLineItem->calculateLineItemPrice->materialIdForDate: ${materialIdForDate}`,
  );

  if (
    lineItemCustomRateIdForDate ||
    (!lineItemId && customRatesGroupId) ||
    (forceInput && customRatesGroupId)
  ) {
    const { price = 0, customRatesGroupLineItemsId } =
      (await CustomRatesGroupLineItemRepo.getHistoricalInstance(ctx.state).getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        customRatesGroupId:
          !forceInput && lineItemCustomRateIdForDate
            ? customRatesGroupIdForDate
            : customRatesGroupId,
        billableLineItemId:
          !forceInput && billableLineItemIdForDate ? billableLineItemIdForDate : billableLineItemId,
        materialId: !forceInput && materialIdForDate ? materialIdForDate : materialId,
      })) ?? {};

    return {
      price: Number(overriddenPrice ?? price),
      customRatesGroupLineItemsId,
    };
  }
  const { price = 0, globalRatesLineItemsId } =
    (await GlobalRatesLineItemRepo.getHistoricalInstance(ctx.state).getRateBySpecificDate({
      specifiedDate,
      businessUnitId,
      businessLineId,
      billableLineItemId:
        !forceInput && billableLineItemIdForDate ? billableLineItemIdForDate : billableLineItemId,
      materialId: !forceInput && materialIdForDate ? materialIdForDate : materialId,
    })) ?? {};

  return {
    price: Number(overriddenPrice ?? price),
    globalRatesLineItemsId,
  };
};

export default calculateLineItemPrice;
