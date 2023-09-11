const calculateSubscriptionOrderPrice = async (
  ctx,
  {
    price: overriddenPrice,
    specifiedDate,
    billableServiceId,
    subscriptionOrderId,
    businessUnitId,
    businessLineId,
    customRatesGroupId = null,
    materialId = null,
    forceInput = false,
  },
  { SubscriptionOrdersRepo, CustomRatesGroupServiceRepo, GlobalRatesServiceRepo },
) => {
  ctx.logger.debug(
    {
      overriddenPrice,
      specifiedDate,
      billableServiceId,
      subscriptionOrderId,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      materialId,
      forceInput,
    },
    `subsOrderService->calculateSubscriptionOrderPrice->params`,
  );
  // In latest version these fields can differ from input
  let oneTimeServiceGlobalRateIdForDate;
  let oneTimeServiceCustomRateIdForDate;
  let customRatesGroupIdForDate;
  let billableServiceIdForDate;
  let materialIdForDate;

  if (subscriptionOrderId) {
    const {
      unlockOverrides,
      price,
      // In latest version these fields can differ from input
      globalRatesServicesId,
      customRatesGroupServicesId,
      customRatesGroupOriginalId: currentCustomRatesGroupId,
      billableServiceOriginalId: currentBillableServiceId,
      materialOriginalId: currentMaterialId,
    } = (await SubscriptionOrdersRepo.getHistoricalInstance(ctx.state).getItemBySpecificDate({
      subscriptionOrderId,
      withOriginalIds: true,
    })) ?? {};

    if (unlockOverrides) {
      return {
        price: Number(overriddenPrice ?? price),
        globalRatesServicesId,
        customRatesGroupServicesId,
      };
    }
    oneTimeServiceGlobalRateIdForDate = globalRatesServicesId || null;
    oneTimeServiceCustomRateIdForDate = customRatesGroupServicesId || null;
    customRatesGroupIdForDate = currentCustomRatesGroupId || null;
    billableServiceIdForDate = currentBillableServiceId;
    materialIdForDate = currentMaterialId || null;
  }
  ctx.logger.debug(
    `subsOrderService->calculateSubscriptionOrderPrice->oneTimeServiceGlobalRateIdForDate: ${oneTimeServiceGlobalRateIdForDate}`,
  );
  ctx.logger.debug(
    `subsOrderService->calculateSubscriptionOrderPrice->oneTimeServiceCustomRateIdForDate: ${oneTimeServiceCustomRateIdForDate}`,
  );
  ctx.logger.debug(
    `subsOrderService->calculateSubscriptionOrderPrice->customRatesGroupIdForDate: ${customRatesGroupIdForDate}`,
  );
  ctx.logger.debug(
    `subsOrderService->calculateSubscriptionOrderPrice->billableServiceIdForDate: ${billableServiceIdForDate}`,
  );
  ctx.logger.debug(
    `subsOrderService->calculateSubscriptionOrderPrice->materialIdForDate: ${materialIdForDate}`,
  );

  if (
    oneTimeServiceCustomRateIdForDate ||
    (!subscriptionOrderId && customRatesGroupId) ||
    (forceInput && customRatesGroupId)
  ) {
    const { price = 0, customRatesGroupServicesId } =
      (await CustomRatesGroupServiceRepo.getHistoricalInstance(ctx.state).getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        customRatesGroupId:
          !forceInput && oneTimeServiceCustomRateIdForDate
            ? customRatesGroupIdForDate
            : customRatesGroupId,
        billableServiceId:
          !forceInput && billableServiceIdForDate ? billableServiceIdForDate : billableServiceId,
        materialId: !forceInput && materialIdForDate ? materialIdForDate : materialId,
      })) ?? {};

    return {
      price: Number(overriddenPrice ?? price),
      customRatesGroupServicesId,
    };
  }
  const { price = 0, globalRatesServicesId } =
    (await GlobalRatesServiceRepo.getHistoricalInstance(ctx.state).getRateBySpecificDate({
      specifiedDate,
      businessUnitId,
      businessLineId,
      billableServiceId:
        !forceInput && billableServiceIdForDate ? billableServiceIdForDate : billableServiceId,
      materialId: !forceInput && materialIdForDate ? materialIdForDate : materialId,
    })) ?? {};

  return {
    price: Number(overriddenPrice ?? price),
    globalRatesServicesId,
  };
};

export default calculateSubscriptionOrderPrice;
