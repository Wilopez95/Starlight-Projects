import ThresholdRepo from '../repos/threshold.js';
import GlobalRatesThresholdRepo from '../repos/globalRatesThreshold.js';
import CustomRatesGroupThresholdRepo from '../repos/customRatesGroupThreshold.js';
import ApiError from '../errors/ApiError.js';

import { RECYCLING_ACTION } from '../consts/actions.js';
import { THRESHOLD_TYPE } from '../consts/thresholdTypes.js';

import { mathRound2 } from '../utils/math.js';
import isNilOrNaN from '../utils/isNilOrNumeric.js';

export const calculateRecyclingThresholds = async (
  ctxState,
  { businessUnitId, businessLineId, customRatesGroupId, materialId, netWeight, action },
) => {
  const thresholdType =
    action === RECYCLING_ACTION.dump ? THRESHOLD_TYPE.dump : THRESHOLD_TYPE.load;

  const threshold = await ThresholdRepo.getInstance(ctxState).getBy({
    condition: {
      businessLineId,
      type: thresholdType,
    },
  });

  if (!threshold) {
    throw ApiError.notFound(`Threshold of type ${thresholdType} not found`);
  }

  const condition = {
    businessUnitId,
    businessLineId,
    thresholdId: threshold.id,
    materialId,
    equipmentItemId: null,
  };

  const [globalRate, customRate] = await Promise.all([
    GlobalRatesThresholdRepo.getInstance(ctxState).getBy({
      condition,
    }),
    customRatesGroupId
      ? CustomRatesGroupThresholdRepo.getInstance(ctxState).getBy({
          condition,
        })
      : Promise.resolve(),
  ]);

  if (customRate) {
    condition.customRatesGroupId = customRatesGroupId;
  }

  const price = !isNilOrNaN(customRate?.price)
    ? Number(customRate.price)
    : Number(globalRate?.price || 0);
  const limit = !isNilOrNaN(customRate?.limit)
    ? Number(customRate.limit)
    : Number(globalRate?.limit || 1);

  return [
    {
      thresholdId: threshold.id,
      globalRatesThresholdsId: globalRate?.id,
      customRatesGroupThresholdsId: customRate ? customRate.id : null,
      price: mathRound2(price),
      quantity: mathRound2(netWeight < limit ? limit : netWeight),
      applySurcharges: false,
    },
  ];
};
