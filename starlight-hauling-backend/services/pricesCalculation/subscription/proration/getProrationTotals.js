import {
  startOfDay,
  isBefore,
  isEqual,
  differenceInDays,
  eachDayOfInterval,
  differenceInCalendarDays,
  isWithinInterval,
} from 'date-fns';
import isNil from 'lodash/isNil.js';
import { getWeekDay } from '../../../../utils/dateTime.js';
import { PRORATION_TYPE } from '../../../../consts/prorationTypes.js';
import { BILLING_CYCLE } from '../../../../consts/billingCycles.js';
import { FREQUENCY_TYPE } from '../../../../consts/frequencyTypes.js';

const areChangesEffective = (effectiveDate, periodFrom) =>
  isNil(effectiveDate)
    ? true
    : isBefore(startOfDay(effectiveDate), periodFrom) ||
      isEqual(startOfDay(effectiveDate), periodFrom);

const getTotalServiceDaysOfWeekPerPeriod = ({
  start,
  end,
  serviceDaysOfWeek,
  frequencyTimes,
  frequencyType,
}) => {
  if (frequencyType === FREQUENCY_TYPE.everyXDays) {
    const totalDaysInInterval = differenceInCalendarDays(end, start) + 1;
    return Math.floor(totalDaysInInterval / frequencyTimes);
  }
  return eachDayOfInterval({ start, end })
    .map(getWeekDay)
    .filter(day => Object.keys(serviceDaysOfWeek).map(Number).includes(day)).length;
};

const getProrationTotals = ({
  billingCycle,
  prorationType,
  serviceDaysOfWeek,
  effectiveDate,
  nextBillingPeriodTo,
  nextBillingPeriodFrom,
  periodFrom,
  periodTo,
  price,
  quantity,
  prevQuantity,
  itemId,
  frequencyTimes,
  frequencyType,
  isLastProrationPeriodInBillingCycle,
  prevProrationEffectiveDate,
  prevProrationEffectivePrice,
  prevProrationOverride,
  oldServiceItems,
}) => {
  if (
    prevProrationOverride &&
    isWithinInterval(prevProrationEffectiveDate, {
      start: nextBillingPeriodFrom,
      end: nextBillingPeriodTo,
    })
  ) {
    return {
      price: null,
      quantity: null,
      totalPrice: null,
      totalDay: null,
      usageDay: null,
      proratedTotal: isLastProrationPeriodInBillingCycle
        ? Number(prevProrationEffectivePrice ?? 0)
        : null,
    };
  }

  const changesAreEffective = areChangesEffective(effectiveDate, periodFrom);
  const isNewItem = isNil(itemId);

  const itemTotals = {};
  itemTotals.quantity = !isNewItem && !changesAreEffective ? prevQuantity ?? 0 : quantity ?? 0;
  itemTotals.price = Number(price ?? 0);
  itemTotals.totalPrice = itemTotals.price * itemTotals.quantity;
  itemTotals.totalDay = differenceInDays(nextBillingPeriodTo, nextBillingPeriodFrom) + 1;

  if (billingCycle === BILLING_CYCLE.daily) {
    itemTotals.usageDay = itemTotals.totalDay;
  } else if (prorationType === PRORATION_TYPE.servicesPerformed) {
    itemTotals.totalDay = getTotalServiceDaysOfWeekPerPeriod({
      start: nextBillingPeriodFrom,
      end: nextBillingPeriodTo,
      serviceDaysOfWeek,
      frequencyTimes,
      frequencyType,
    });
    itemTotals.usageDay = changesAreEffective
      ? getTotalServiceDaysOfWeekPerPeriod({
          start: periodFrom,
          end: periodTo,
          serviceDaysOfWeek,
          frequencyTimes,
          frequencyType,
        })
      : 0;
  } else {
    itemTotals.usageDay = changesAreEffective ? differenceInDays(periodTo, periodFrom) + 1 : 0;
  }

  const newProratedTotal = (itemTotals.totalPrice / itemTotals.totalDay) * itemTotals.usageDay;
  itemTotals.proratedTotal = oldServiceItems?.[0].prorationEffectivePrice ?? newProratedTotal;

  return itemTotals;
};

export default getProrationTotals;
