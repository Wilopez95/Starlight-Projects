import { isOneTimeServicePriceIncluded } from '../common/serviceInclusions.js';
import { pricingGetSubscriptionsOrdersBy } from '../../../pricing.js';

const calculateSubscriptionOrderPrice = async (
  ctx,
  {
    price: overriddenPrice,
    specifiedDate,
    billableServiceId,
    parentBillableServiceId,
    subscriptionOrderId,
    businessUnitId,
    businessLineId,
    customRatesGroupId = null,
    materialId = null,
    forceInput = false,
    billableServiceInclusions = {},
  },
  { CustomRatesGroupServiceRepo, GlobalRatesServiceRepo },
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
    console.log(
      '🚀 aa16 ~ file: subscriptionOrderPrice.js:43 ~  ~ starting timer for pricingGetSubscriptionsOrdersBy ****Pricing Resquest****:🚀',
    );
    const start = Date.now();
    const {
      unlockOverrides,
      price,

      // In latest version these fields can differ from input
      globalRatesServicesId,
      customRatesGroupServicesId,
      customRatesGroupOriginalId: currentCustomRatesGroupId,
      billableServiceOriginalId: currentBillableServiceId,
      materialOriginalId: currentMaterialId,
    } = (await pricingGetSubscriptionsOrdersBy(ctx, { data: { id: subscriptionOrderId } })) ?? {};
    const timeTaken = Date.now() - start;
    console.log(
      '🚀 aa16 ~ file: subscriptionOrderPrice.js:59 ~  ~ pricingGetSubscriptionsOrdersBy ****Pricing Resquest****:🚀',
      timeTaken,
    );
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
    console.log(
      '🚀 aa17 ~ file: subscriptionOrderPrice.js:97 ~  ~ starting timer for CustomRatesGroupServiceRepo.getHistoricalInstance:🚀',
    );
    const start = Date.now();
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
    const timeTaken = Date.now() - start;
    console.log(
      '🚀 aa17 ~ file: subscriptionOrderPrice.js:115 ~  ~ CustomRatesGroupServiceRepo.getHistoricalInstance:🚀',
      timeTaken,
    );
    return {
      price: Number(
        overriddenPrice ??
          (isOneTimeServicePriceIncluded({
            billableServiceId,
            parentBillableServiceId,
            billableServiceInclusions,
          })
            ? 0
            : price),
      ),
      customRatesGroupServicesId,
    };
  }
  console.log(
    '🚀 aa18 ~ file: subscriptionOrderPrice.js:133 ~  ~ starting timer for GlobalRatesServiceRepo.getHistoricalInstance:🚀',
  );
  const start = Date.now();
  const { price = 0, globalRatesServicesId } =
    (await GlobalRatesServiceRepo.getHistoricalInstance(ctx.state).getRateBySpecificDate({
      specifiedDate,
      businessUnitId,
      businessLineId,
      billableServiceId:
        !forceInput && billableServiceIdForDate ? billableServiceIdForDate : billableServiceId,
      materialId: !forceInput && materialIdForDate ? materialIdForDate : materialId,
    })) ?? {};
  const timeTaken = Date.now() - start;
  console.log(
    '🚀 aa18 ~ file: subscriptionOrderPrice.js:147 ~  ~ GlobalRatesServiceRepo.getHistoricalInstance:🚀',
    timeTaken,
  );
  return {
    price: Number(
      overriddenPrice ??
        (isOneTimeServicePriceIncluded({
          billableServiceId,
          parentBillableServiceId,
          billableServiceInclusions,
        })
          ? 0
          : price),
    ),
    globalRatesServicesId,
  };
};

export default calculateSubscriptionOrderPrice;
