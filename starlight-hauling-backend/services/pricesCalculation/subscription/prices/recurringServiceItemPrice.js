/* eslint-disable complexity */
import { isRecurringServicePriceIncluded } from '../common/serviceInclusions.js';
import { pricingGetSubscriptionServiceItemById } from '../../../pricing.js';

const calculateRecurringServiceItemPrice = async (
  ctx,
  {
    price: overriddenPrice,
    serviceItemId,
    serviceFrequencyId = null,
    billableServiceId,
    materialId = null,
    specifiedDate,
    businessUnitId,
    businessLineId,
    customRatesGroupId = null,
    forceInput = false,
    billableServiceInclusions = {},
  },
  // pre-pricing service code:
  // {
  //   SubscriptionServiceItemRepo,
  //   RecurringServicesCustomRatesRepo,
  //   RecurringServicesGlobalRatesRepo,
  // },
  { RecurringServicesCustomRatesRepo, RecurringServicesGlobalRatesRepo },
) => {
  ctx.logger.debug(
    {
      overriddenPrice,
      serviceItemId,
      serviceFrequencyId,
      billableServiceId,
      materialId,
      specifiedDate,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      forceInput,
    },
    `subsServiceItemService->calculateRecurringServiceItemPrice->params`,
  );
  // At specified Date these fields can differ from input
  let recurringServiceGlobalRateIdForDate;
  let recurringServiceCustomRateIdForDate;
  let customRatesGroupIdForDate;
  let billableServiceIdForDate;
  let frequencyIdForDate;
  let materialIdForDate;
  let prevQuantity;
  let prevProrationEffectiveDate;
  let prevProrationEffectivePrice;
  let prevProrationOverride;

  if (serviceItemId) {
    console.log(
      '🚀 aa10 ~ file: recurringServiceItemPrice.js:57 ~  ~ starting timer for pricingGetSubscriptionServiceItemById (****Pricing endpont****):🚀',
    );
    const start = Date.now();
    const {
      unlockOverrides,
      price,
      quantity,
      frequencyTimes,
      frequencyType,
      prorationEffectiveDate,
      prorationEffectivePrice,
      prorationOverride,
      // At specified Date these fields can differ from input
      globalRatesRecurringServicesId,
      customRatesGroupServicesId,
      customRatesGroupOriginalId: currentCustomRatesGroupId,
      billableServiceOriginalId: currentBillableServiceId,
      serviceFrequencyId: currentFrequencyId,
      materialOriginalId: currentMaterialId,
    } = (await pricingGetSubscriptionServiceItemById(ctx, { data: { id: serviceItemId } }))[0] ??
    {};

    const timeTaken = Date.now() - start;
    console.log(
      '🚀 aa10 ~ file: recurringServiceItemPrice.js:81 ~  ~ pricingGetSubscriptionServiceItemById (****Pricing endpont****):🚀',
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
        globalRatesRecurringServicesId,
        customRatesGroupServicesId,
        frequencyTimes,
        frequencyType,
      };
    }
    recurringServiceGlobalRateIdForDate = globalRatesRecurringServicesId || null;
    recurringServiceCustomRateIdForDate = customRatesGroupServicesId || null;
    customRatesGroupIdForDate = currentCustomRatesGroupId || null;
    billableServiceIdForDate = currentBillableServiceId || null;
    frequencyIdForDate = currentFrequencyId || null;
    materialIdForDate = currentMaterialId || null;
  }

  ctx.logger.debug(
    // eslint-disable-next-line max-len
    `subsServiceItemService->calculateRecurringServiceItemPrice->recurringServiceGlobalRateIdForDate: ${recurringServiceGlobalRateIdForDate}`,
  );
  ctx.logger.debug(
    // eslint-disable-next-line max-len
    `subsServiceItemService->calculateRecurringServiceItemPrice->recurringServiceCustomRateIdForDate: ${recurringServiceCustomRateIdForDate}`,
  );
  ctx.logger.debug(
    `subsServiceItemService->calculateRecurringServiceItemPrice->customRatesGroupIdForDate: ${customRatesGroupIdForDate}`,
  );
  ctx.logger.debug(
    `subsServiceItemService->calculateRecurringServiceItemPrice->billableServiceIdForDate: ${billableServiceIdForDate}`,
  );
  ctx.logger.debug(
    `subsServiceItemService->calculateRecurringServiceItemPrice->frequencyIdForDate: ${frequencyIdForDate}`,
  );
  ctx.logger.debug(
    `subsServiceItemService->calculateRecurringServiceItemPrice->materialIdForDate: ${materialIdForDate}`,
  );
  if (
    recurringServiceCustomRateIdForDate ||
    (!serviceItemId && customRatesGroupId) ||
    (forceInput && customRatesGroupId)
  ) {
    console.log(
      '🚀 aa11 ~ file: recurringServiceItemPrice.js:137 ~  ~ starting timer for RecurringServicesCustomRatesRepo.getHistoricalInstance:🚀',
    );
    const start = Date.now();
    const {
      price = 0,
      frequencyTimes,
      frequencyType,
      customRatesGroupServicesId,
    } = (await RecurringServicesCustomRatesRepo.getHistoricalInstance(
      ctx.state,
    ).getRateBySpecificDate({
      specifiedDate,
      businessUnitId,
      businessLineId,
      customRatesGroupId:
        !forceInput && recurringServiceCustomRateIdForDate
          ? customRatesGroupIdForDate
          : customRatesGroupId,
      billableServiceId:
        !forceInput && billableServiceIdForDate ? billableServiceIdForDate : billableServiceId,
      serviceFrequencyId:
        !forceInput && frequencyIdForDate ? frequencyIdForDate : serviceFrequencyId,
      materialId: !forceInput && materialIdForDate ? materialIdForDate : materialId,
    })) ?? {};
    const timeTaken = Date.now() - start;
    console.log(
      '🚀 aa11 ~ file: recurringServiceItemPrice.js:163 ~  ~ RecurringServicesCustomRatesRepo.getHistoricalInstance:🚀',
      timeTaken,
    );
    return {
      price: Number(
        overriddenPrice ??
          (isRecurringServicePriceIncluded(billableServiceId, billableServiceInclusions)
            ? 0
            : price),
      ),
      customRatesGroupServicesId,
      prevQuantity,
      prevProrationEffectiveDate,
      prevProrationEffectivePrice,
      prevProrationOverride,
      frequencyTimes,
      frequencyType,
    };
  }
  console.log(
    '🚀 aa12 ~ file: recurringServiceItemPrice.js:183 ~  ~ starting timer for RecurringServicesGlobalRatesRepo.getHistoricalInstance:🚀',
  );
  const start = Date.now();

  const {
    price = 0,
    frequencyTimes,
    frequencyType,
    globalRatesRecurringServicesId,
  } = (await RecurringServicesGlobalRatesRepo.getHistoricalInstance(
    ctx.state,
  ).getRateBySpecificDate({
    specifiedDate,
    businessUnitId,
    businessLineId,
    billableServiceId:
      !forceInput && billableServiceIdForDate ? billableServiceIdForDate : billableServiceId,
    serviceFrequencyId: !forceInput && frequencyIdForDate ? frequencyIdForDate : serviceFrequencyId,
    materialId: !forceInput && materialIdForDate ? materialIdForDate : materialId,
  })) ?? {};

  const timeTaken = Date.now() - start;
  console.log(
    '🚀 aa12 ~ file: recurringServiceItemPrice.js:206 ~  ~ RecurringServicesGlobalRatesRepo.getHistoricalInstance:🚀',
    timeTaken,
  );

  return {
    price: Number(
      overriddenPrice ??
        (isRecurringServicePriceIncluded(billableServiceId, billableServiceInclusions) ? 0 : price),
    ),
    globalRatesRecurringServicesId,
    prevQuantity,
    prevProrationEffectiveDate,
    prevProrationEffectivePrice,
    prevProrationOverride,
    frequencyTimes,
    frequencyType,
  };
};

export default calculateRecurringServiceItemPrice;
