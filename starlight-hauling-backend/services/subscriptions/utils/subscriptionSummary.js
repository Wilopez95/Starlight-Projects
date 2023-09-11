/* eslint-disable no-continue */
import { NOT_APPLICABLE_BILLING_CYCLE } from '../../../consts/billingCycles.js';
import { PRORATION_TYPE } from '../../../consts/prorationTypes.js';

import {
  countCertainDays,
  compareDateAsc,
  differenceInDays,
  isDayBetween,
  differenceInCalendarDays,
} from '../../../utils/dateTime.js';

import { mathRound2 } from '../../../utils/math.js';

const getFinalPrice = providedServiceCount => (price, maxServiceCount) =>
  (price / maxServiceCount) * providedServiceCount;

const aggregateLineItem = lineItemsInfo => {
  const liInfo = [];
  for (const item of lineItemsInfo) {
    const { lineItems = [], serviceDaysOfWeek } = item;
    // in case lineItems is null
    if (!lineItems) {
      continue;
    }

    const lineItemServiceDays = lineItems.map(lineItem => ({
      serviceDaysOfWeek,
      ...lineItem,
    }));
    liInfo.push(...lineItemServiceDays);
  }
  return liInfo;
};

const getApplicability = ({
  anniversaryBilling,
  billingCycle,
  nextBillingPeriodTo,
  effectiveDate,
}) => {
  const isAllowedBillingCycle = NOT_APPLICABLE_BILLING_CYCLE.includes(billingCycle);
  const isEffectiveDateGreater = compareDateAsc(effectiveDate, nextBillingPeriodTo) === 1;

  if (isAllowedBillingCycle && !anniversaryBilling && isEffectiveDateGreater) {
    return false;
  }

  return true;
};

const sortSubscriptionOrders = ({ subscriptionOrdersInfo, nextBillingPeriodTo }) => {
  const subscriptionOrders = subscriptionOrdersInfo.filter(order => {
    const { serviceDate } = order;

    return compareDateAsc(nextBillingPeriodTo, serviceDate) !== -1 || !nextBillingPeriodTo;
  });

  return subscriptionOrders;
};

const subscriptionOrdersSummary = ({ subscriptionOrdersInfo, nextBillingPeriodTo }) => {
  const subscriptionOrders = sortSubscriptionOrders({
    subscriptionOrdersInfo,
    nextBillingPeriodTo,
  });
  const total = subscriptionOrders.reduce((accumulator, currentValue) => {
    const { quantity, price, grandTotal } = currentValue;
    // eslint-disable-next-line no-constant-binary-expression
    return accumulator + grandTotal ?? quantity * price;
  }, 0);

  return total;
};

const proratedChangeOneByOne = ({
  nextEffectiveDate,
  effectiveDate,
  daysInBillingCycle,
  nextBillingPeriodTo,
  nextBillingPeriodFrom,
  price,
  quantity,
}) => {
  const totalPrice = price * quantity;

  const usageDay = differenceInCalendarDays(nextEffectiveDate, effectiveDate);

  const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

  return {
    totalPrice,
    totalDay: daysInBillingCycle,
    usageDay,
    proratedTotal: mathRound2(finalPrice),
    effectiveDate,
    price,
    quantity,
    since: effectiveDate,
    from: nextEffectiveDate,
    nextBillingPeriodTo,
    nextBillingPeriodFrom,
  };
};

const proratedPreviousEffectiveInfo = ({
  sortByEffectiveDate,
  nextBillingPeriodFrom,
  nextEffectiveDate,
  daysInBillingCycle,
  nextBillingPeriodTo,
}) => {
  // we should now previous effective info
  const sortedServiceItems = sortByEffectiveDate.filter(
    itm => compareDateAsc(nextBillingPeriodFrom, itm.effectiveDate) !== -1,
  );
  const latestServiceItemInfo = sortedServiceItems.pop();

  const {
    price: actualPrice,
    quantity: actualQuantity,
    effectiveDate: actualEffectiveDate,
  } = latestServiceItemInfo;

  const actualTotalPrice = actualPrice * actualQuantity;

  const usageDay = differenceInCalendarDays(nextEffectiveDate, nextBillingPeriodFrom);
  const finalPrice = getFinalPrice(usageDay)(actualTotalPrice, daysInBillingCycle);

  return {
    totalPrice: actualTotalPrice,
    totalDay: daysInBillingCycle,
    usageDay,
    price: actualPrice,
    quantity: actualQuantity,
    proratedTotal: mathRound2(finalPrice),
    effectiveDate: actualEffectiveDate,
    since: nextBillingPeriodFrom,
    from: nextEffectiveDate,
    nextBillingPeriodTo,
    nextBillingPeriodFrom,
  };
};

const usageDayLineItemCalc = ({ lineItemsInfo, nextBillingPeriodFrom, nextBillingPeriodTo }) => {
  const sortByEffectiveLineItems = lineItemsInfo.sort(
    (left, right) => new Date(left.effectiveDate) - new Date(right.effectiveDate),
  );

  const daysInBillingCycle = differenceInDays(nextBillingPeriodTo, nextBillingPeriodFrom);

  const result = [];

  for (let i = 0; i < sortByEffectiveLineItems.length; ++i) {
    const { price, quantity, effectiveDate, lineItemId, ...rest } = sortByEffectiveLineItems[i];
    const nextBillingCycleInfo = sortByEffectiveLineItems[i + 1];
    const totalPrice = price * quantity;

    if (nextBillingCycleInfo) {
      const { effectiveDate: nextEffectiveDate } = nextBillingCycleInfo;
      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(nextBillingPeriodTo, effectiveDate) !== -1
        : false;

      const inCurrentBillingCycleNextEffectiveDate = nextEffectiveDate
        ? isDayBetween(nextBillingPeriodFrom, nextEffectiveDate, nextBillingPeriodTo)
        : false;

      if (inCurrentBillingCycle && inCurrentBillingCycleNextEffectiveDate) {
        const info = proratedChangeOneByOne({
          nextEffectiveDate,
          effectiveDate,
          daysInBillingCycle,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          price,
          quantity,
        });

        result.push({ ...info, lineItemId, ...rest });
      }
      if (!inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const usageDay = differenceInDays(nextBillingPeriodTo, nextBillingPeriodFrom);
        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);
        const isEffectiveDateGreater = compareDateAsc(effectiveDate, nextBillingPeriodTo) === 1;

        if (isEffectiveDateGreater) {
          continue;
        }
        result.push({
          totalPrice,
          totalDay: daysInBillingCycle,
          usageDay,
          price,
          quantity,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          since: nextBillingPeriodFrom,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          ...rest,
          lineItemId,
        });
      }

      if (inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const usageDay = differenceInDays(nextBillingPeriodTo, effectiveDate);
        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        const isEffectiveDateGreater = compareDateAsc(effectiveDate, nextBillingPeriodTo) === 1;

        if (isEffectiveDateGreater) {
          continue;
        }

        result.push({
          totalPrice,
          totalDay: daysInBillingCycle,
          usageDay,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          price,
          quantity,
          since: effectiveDate,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          lineItemId,
          ...rest,
        });
      }
      if (!inCurrentBillingCycle && inCurrentBillingCycleNextEffectiveDate) {
        const usageDay = differenceInCalendarDays(nextEffectiveDate, nextBillingPeriodFrom);

        if (!usageDay) {
          continue;
        }
        const info = proratedPreviousEffectiveInfo({
          sortByEffectiveDate: sortByEffectiveLineItems,
          nextBillingPeriodFrom,
          nextEffectiveDate,
          daysInBillingCycle,
          nextBillingPeriodTo,
        });

        result.push({ ...info, lineItemId, ...rest });
      }
    }

    if (!nextBillingCycleInfo) {
      const isEffectiveDateGreater = compareDateAsc(effectiveDate, nextBillingPeriodTo) === 1;

      if (isEffectiveDateGreater) {
        continue;
      }

      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(effectiveDate, nextBillingPeriodFrom) === 1
        : false;

      const startUsageDay = inCurrentBillingCycle ? effectiveDate : nextBillingPeriodFrom;

      const usageDay = differenceInDays(nextBillingPeriodTo, startUsageDay);

      const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

      result.push({
        totalPrice,
        totalDay: daysInBillingCycle,
        usageDay,
        price,
        quantity,
        proratedTotal: mathRound2(finalPrice),
        effectiveDate,
        since: inCurrentBillingCycle ? effectiveDate : nextBillingPeriodFrom,
        from: nextBillingPeriodTo,
        nextBillingPeriodTo,
        nextBillingPeriodFrom,
        lineItemId,
        ...rest,
      });
    }
  }

  return result;
};

const usageDaysCalc = params => {
  const {
    serviceItems,
    nextBillingPeriodFrom,
    nextBillingPeriodTo,
    anniversaryBilling,
    billingCycle,
  } = params;
  const sortByEffectiveServiceItems = serviceItems.sort(
    (left, right) => new Date(left.effectiveDate) - new Date(right.effectiveDate),
  );
  const daysInBillingCycle = differenceInDays(nextBillingPeriodTo, nextBillingPeriodFrom);

  const result = [];

  const lineItemsInfo = aggregateLineItem(sortByEffectiveServiceItems);
  let lineItemsProrationInfo = [];

  if (nextBillingPeriodFrom) {
    lineItemsProrationInfo = usageDayLineItemCalc({
      lineItemsInfo,
      nextBillingPeriodFrom,
      nextBillingPeriodTo,
    });
  }

  for (let i = 0; i < sortByEffectiveServiceItems.length; ++i) {
    const {
      price,
      quantity,
      effectiveDate,
      subscriptionOrders: subscriptionOrdersInfo,
      description,
      prorationEffectivePrice,
      prorationEffectiveDate,
      billableServiceId,
      serviceItemId,
    } = sortByEffectiveServiceItems[i];

    const nextBillingCycleInfo = sortByEffectiveServiceItems[i + 1];
    const totalPrice = price * quantity;

    const isApplicable = getApplicability({
      anniversaryBilling,
      billingCycle,
      nextBillingPeriodFrom,
      nextBillingPeriodTo,
      effectiveDate,
    });

    if (!isApplicable) {
      const objInfo = {
        isApplicable: false,
        effectiveDate,
        nextBillingPeriodFrom,
        nextBillingPeriodTo,
        billableServiceId,
      };
      result.push(objInfo);
      continue;
    }

    if (nextBillingCycleInfo) {
      const { effectiveDate: nextEffectiveDate } = nextBillingCycleInfo;
      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(effectiveDate, nextBillingPeriodFrom) === 1
        : false;

      const inCurrentBillingCycleNextEffectiveDate = nextEffectiveDate
        ? isDayBetween(nextBillingPeriodFrom, nextEffectiveDate, nextBillingPeriodTo)
        : false;

      if (inCurrentBillingCycle && inCurrentBillingCycleNextEffectiveDate) {
        const info = proratedChangeOneByOne({
          nextEffectiveDate,
          effectiveDate,
          daysInBillingCycle,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          price,
          quantity,
        });
        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });

          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        result.push({
          ...info,
          isApplicable: true,
          subscriptionOrdersTotal,
          subscriptionOrdersSort,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          billableServiceId,
          serviceItemId,
        });
      }

      if (!inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const usageDay = differenceInDays(nextBillingPeriodTo, nextBillingPeriodFrom);
        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });

          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }
        result.push({
          totalPrice,
          totalDay: daysInBillingCycle,
          usageDay,
          price,
          quantity,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          since: nextBillingPeriodFrom,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          isApplicable: true,
          subscriptionOrdersTotal,
          subscriptionOrdersSort,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          billableServiceId,
          serviceItemId,
        });
      }
      if (inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const usageDay = differenceInDays(nextBillingPeriodTo, effectiveDate);
        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });

          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });
        }

        result.push({
          totalPrice,
          totalDay: daysInBillingCycle,
          usageDay,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          price,
          quantity,
          since: effectiveDate,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          subscriptionOrdersTotal,
          isApplicable: true,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          subscriptionOrdersSort,
          billableServiceId,
          serviceItemId,
        });
      }
      if (
        !inCurrentBillingCycle &&
        inCurrentBillingCycleNextEffectiveDate &&
        nextBillingCycleInfo
      ) {
        const info = proratedPreviousEffectiveInfo({
          sortByEffectiveDate: sortByEffectiveServiceItems,
          nextBillingPeriodFrom,
          nextEffectiveDate,
          daysInBillingCycle,
          nextBillingPeriodTo,
        });

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });
          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        result.push({
          ...info,
          isApplicable: true,
          subscriptionOrdersTotal,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          subscriptionOrdersSort,
          billableServiceId,
          serviceItemId,
        });
      }
    }
    if (!nextBillingCycleInfo) {
      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(effectiveDate, nextBillingPeriodFrom) === 1
        : false;

      const startUsageDay = inCurrentBillingCycle ? effectiveDate : nextBillingPeriodFrom;
      const usageDay = differenceInDays(nextBillingPeriodTo, startUsageDay);
      const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

      let subscriptionOrdersTotal = 0;
      let subscriptionOrdersSort = [];

      if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
        subscriptionOrdersSort = sortSubscriptionOrders({
          subscriptionOrdersInfo,
          nextBillingPeriodTo,
        });

        subscriptionOrdersTotal = subscriptionOrdersSummary({
          subscriptionOrdersInfo,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        });
      }

      let prices = {
        totalPrice,
        price,
        quantity,
        proratedTotal: mathRound2(finalPrice),
      };

      if (!nextBillingPeriodFrom) {
        prices = {
          totalPrice: 0,
          price: 0,
          quantity: 0,
          proratedTotal: 0,
        };
      }

      result.push({
        totalDay: daysInBillingCycle,
        usageDay,
        effectiveDate,
        since: startUsageDay,
        from: nextBillingPeriodTo,
        nextBillingPeriodTo,
        nextBillingPeriodFrom,
        subscriptionOrdersTotal,
        isApplicable: true,
        description,
        prorationEffectivePrice,
        prorationEffectiveDate,
        subscriptionOrdersSort,
        billableServiceId,
        serviceItemId,
        ...prices,
      });
    }
  }
  return {
    lineItemsProrationInfo,
    serviceItemProrationInfo: result,
  };
};

const servicesPerformedOneByOne = ({
  price,
  quantity,
  effectiveDate,
  nextBillingPeriodFrom,
  serviceDaysOfWeek,
  nextBillingPeriodTo,
  nextEffectiveDate,
}) => {
  const totalPrice = price * quantity;
  const days = Object.keys(serviceDaysOfWeek);

  const usageDay = countCertainDays(days, effectiveDate, nextEffectiveDate);
  const daysInBillingCycle = countCertainDays(days, nextBillingPeriodFrom, nextBillingPeriodTo);
  const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

  return {
    totalPrice,
    totalDay: daysInBillingCycle,
    usageDay,
    proratedTotal: mathRound2(finalPrice),
    effectiveDate,
    nextBillingPeriodTo,
    nextBillingPeriodFrom,
  };
};

const servicePerformedForLineItems = ({
  lineItemsInfo,
  nextBillingPeriodFrom,
  nextBillingPeriodTo,
  // serviceDaysOfWeek,
}) => {
  const sortByEffectiveLineItems = lineItemsInfo.sort(
    (left, right) => new Date(left.effectiveDate) - new Date(right.effectiveDate),
  );

  const result = [];

  for (let i = 0; i < sortByEffectiveLineItems.length; ++i) {
    const {
      price,
      quantity,
      effectiveDate,
      serviceDaysOfWeek: incommingServiceDaysOfWeek,
      subscriptionOrders: subscriptionOrdersInfo,
      description,
      prorationEffectivePrice,
      prorationEffectiveDate,
      billableServiceId,
      serviceItemId,
      ...rest
    } = sortByEffectiveLineItems[i];

    const serviceDaysOfWeek = incommingServiceDaysOfWeek || {};

    const nextBillingCycleInfo = sortByEffectiveLineItems[i + 1];
    const totalPrice = price * quantity;

    if (nextBillingCycleInfo) {
      const { effectiveDate: nextEffectiveDate } = nextBillingCycleInfo;
      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(effectiveDate, nextBillingPeriodFrom) === 1
        : false;

      const inCurrentBillingCycleNextEffectiveDate = nextEffectiveDate
        ? isDayBetween(nextBillingPeriodFrom, nextEffectiveDate, nextBillingPeriodTo)
        : false;

      if (inCurrentBillingCycle && inCurrentBillingCycleNextEffectiveDate) {
        const info = servicesPerformedOneByOne({
          price,
          quantity,
          effectiveDate,
          nextBillingPeriodFrom,
          serviceDaysOfWeek,
          nextBillingPeriodTo,
          nextEffectiveDate,
        });
        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });

          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }
        result.push({
          ...info,
          isApplicable: true,
          subscriptionOrdersTotal,
          subscriptionOrdersSort,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          billableServiceId,
          serviceItemId,
        });
      }

      if (!inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const days = Object.keys(serviceDaysOfWeek);
        const usageDay = countCertainDays(days, nextBillingPeriodFrom, nextBillingPeriodTo);
        const daysInBillingCycle = countCertainDays(
          days,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        );

        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });

          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        result.push({
          totalPrice,
          totalDay: daysInBillingCycle,
          usageDay,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          since: effectiveDate,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          isApplicable: true,
          subscriptionOrdersSort,
          subscriptionOrdersTotal,
          ...rest,
        });
      }

      if (inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const inCurrentBillingCycleEffectiveDate = isDayBetween(
          nextBillingPeriodFrom,
          effectiveDate,
          nextBillingPeriodTo,
        );

        if (!inCurrentBillingCycleEffectiveDate) {
          continue;
        }

        const days = Object.keys(serviceDaysOfWeek);
        const usageDay = countCertainDays(days, effectiveDate, nextBillingPeriodTo);
        const daysInBillingCycle = countCertainDays(
          days,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        );

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });

          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });
        }
        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        result.push({
          totalPrice,
          totalDay: daysInBillingCycle,
          usageDay,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          since: effectiveDate,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          subscriptionOrdersTotal,
          nextBillingPeriodFrom,
          subscriptionOrdersSort,
          isApplicable: true,
          ...rest,
        });
      }
      if (!inCurrentBillingCycle && inCurrentBillingCycleNextEffectiveDate) {
        const sortedServiceItems = sortByEffectiveLineItems.filter(
          itm => compareDateAsc(nextBillingPeriodFrom, itm.effectiveDate) !== -1,
        );
        const latestServiceItemInfo = sortedServiceItems.pop();

        const {
          price: actualPrice,
          quantity: actualQuantity,
          effectiveDate: actualEffectiveDate,
        } = latestServiceItemInfo;

        const actualTotalPrice = actualPrice * actualQuantity;
        const days = Object.keys(serviceDaysOfWeek);

        const usageDay = countCertainDays(days, nextEffectiveDate, nextBillingPeriodTo);
        const daysInBillingCycle = countCertainDays(
          days,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        );

        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });

          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });
        }

        result.push({
          totalPrice: actualTotalPrice,
          totalDay: daysInBillingCycle,
          usageDay,
          price: actualPrice,
          quantity: actualQuantity,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate: actualEffectiveDate,
          since: nextBillingPeriodFrom,
          from: nextEffectiveDate,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          isApplicable: true,
          subscriptionOrdersSort,
          subscriptionOrdersTotal,
          ...rest,
        });
      }
    } else {
      const isEffectiveDateGreater = compareDateAsc(effectiveDate, nextBillingPeriodTo) === 1;

      if (isEffectiveDateGreater) {
        continue;
      }
      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(effectiveDate, nextBillingPeriodFrom) === 1
        : false;
      const startUsageDay = inCurrentBillingCycle ? effectiveDate : nextBillingPeriodFrom;

      const days = Object.keys(serviceDaysOfWeek);
      const usageDay = countCertainDays(days, startUsageDay, nextBillingPeriodTo);
      const daysInBillingCycle = countCertainDays(days, nextBillingPeriodFrom, nextBillingPeriodTo);

      const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

      let subscriptionOrdersTotal = 0;
      let subscriptionOrdersSort = [];

      if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
        subscriptionOrdersTotal = subscriptionOrdersSummary({
          subscriptionOrdersInfo,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        });

        subscriptionOrdersSort = sortSubscriptionOrders({
          subscriptionOrdersInfo,
          nextBillingPeriodTo,
        });
      }

      result.push({
        totalDay: daysInBillingCycle,
        usageDay,
        isApplicable: true,
        price,
        quantity,
        proratedTotal: mathRound2(finalPrice),
        effectiveDate,
        subscriptionOrdersTotal,
        subscriptionOrdersSort,
        since: effectiveDate,
        from: nextBillingPeriodTo,
        nextBillingPeriodTo,
        nextBillingPeriodFrom,
        ...rest,
      });
    }
  }
  return result;
};

const servicesPerformedTotalAmount = ({
  serviceItems,
  nextBillingPeriodFrom,
  anniversaryBilling,
  billingCycle,
  nextBillingPeriodTo,
}) => {
  const sortByEffectiveServiceItems = serviceItems.sort(
    (left, right) => new Date(left.effectiveDate) - new Date(right.effectiveDate),
  );

  const result = [];

  const lineItemsInfo = aggregateLineItem(sortByEffectiveServiceItems);

  const lineItemsProrationInfo = servicePerformedForLineItems({
    lineItemsInfo,
    nextBillingPeriodFrom,
    nextBillingPeriodTo,
  });

  for (let i = 0; i < sortByEffectiveServiceItems.length; ++i) {
    const {
      price,
      quantity,
      effectiveDate,
      subscriptionOrders: subscriptionOrdersInfo,
      // due to null
      serviceDaysOfWeek: incommingServiceDaysOfWeek,
      description,
      prorationEffectivePrice,
      prorationEffectiveDate,
      billableServiceId,
      serviceItemId,
    } = sortByEffectiveServiceItems[i];

    const serviceDaysOfWeek = incommingServiceDaysOfWeek || {};

    const nextBillingCycleInfo = sortByEffectiveServiceItems[i + 1];

    const totalPrice = price * quantity;

    const isApplicable = getApplicability({
      anniversaryBilling,
      billingCycle,
      nextBillingPeriodFrom,
      nextBillingPeriodTo,
      effectiveDate,
    });

    if (!isApplicable) {
      const objInfo = {
        isApplicable: false,
        effectiveDate,
        nextBillingPeriodFrom,
        nextBillingPeriodTo,
        billableServiceId,
      };
      result.push(objInfo);
      continue;
    }

    if (nextBillingCycleInfo) {
      const { effectiveDate: nextEffectiveDate } = nextBillingCycleInfo;
      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(effectiveDate, nextBillingPeriodFrom) === 1
        : false;

      const inCurrentBillingCycleNextEffectiveDate = nextEffectiveDate
        ? isDayBetween(nextBillingPeriodFrom, nextEffectiveDate, nextBillingPeriodTo)
        : false;

      if (inCurrentBillingCycle && inCurrentBillingCycleNextEffectiveDate) {
        const info = servicesPerformedOneByOne({
          price,
          quantity,
          effectiveDate,
          nextBillingPeriodFrom,
          serviceDaysOfWeek,
          nextBillingPeriodTo,
          nextEffectiveDate,
        });

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });

          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        result.push({
          ...info,
          subscriptionOrdersTotal,
          description,
          prorationEffectivePrice,
          isApplicable: true,
          prorationEffectiveDate,
          subscriptionOrdersSort,
          billableServiceId,
          serviceItemId,
        });
      }

      if (!inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const days = Object.keys(serviceDaysOfWeek);
        const usageDay = countCertainDays(days, nextBillingPeriodFrom, nextBillingPeriodTo);
        const daysInBillingCycle = countCertainDays(
          days,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        );

        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });

          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        result.push({
          totalPrice,
          totalDay: daysInBillingCycle,
          isApplicable: true,
          usageDay,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          since: effectiveDate,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          subscriptionOrdersTotal,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          subscriptionOrdersSort,
          billableServiceId,
          serviceItemId,
        });
      }

      if (inCurrentBillingCycle && !inCurrentBillingCycleNextEffectiveDate) {
        const days = Object.keys(serviceDaysOfWeek);
        const usageDay = countCertainDays(days, effectiveDate, nextBillingPeriodTo);
        const daysInBillingCycle = countCertainDays(
          days,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        );
        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });

          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        result.push({
          totalPrice,
          isApplicable: true,
          totalDay: daysInBillingCycle,
          usageDay,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate,
          since: effectiveDate,
          from: nextBillingPeriodTo,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          subscriptionOrdersTotal,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          subscriptionOrdersSort,
          billableServiceId,
          serviceItemId,
        });
      }
      if (
        !inCurrentBillingCycle &&
        inCurrentBillingCycleNextEffectiveDate &&
        nextBillingCycleInfo
      ) {
        // we should now previous effective info
        const sortedServiceItems = sortByEffectiveServiceItems.filter(
          itm => compareDateAsc(nextBillingPeriodFrom, itm.effectiveDate) !== -1,
        );
        const latestServiceItemInfo = sortedServiceItems.pop();

        const {
          price: actualPrice,
          quantity: actualQuantity,
          effectiveDate: actualEffectiveDate,
        } = latestServiceItemInfo;

        const actualTotalPrice = actualPrice * actualQuantity;
        const days = Object.keys(serviceDaysOfWeek);

        const usageDay = countCertainDays(days, nextEffectiveDate, nextBillingPeriodTo);
        const daysInBillingCycle = countCertainDays(
          days,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
        );

        let subscriptionOrdersTotal = 0;
        let subscriptionOrdersSort = [];

        if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
          subscriptionOrdersSort = sortSubscriptionOrders({
            subscriptionOrdersInfo,
            nextBillingPeriodTo,
          });
          subscriptionOrdersTotal = subscriptionOrdersSummary({
            subscriptionOrdersInfo,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);

        result.push({
          totalPrice: actualTotalPrice,
          isApplicable: true,
          totalDay: daysInBillingCycle,
          usageDay,
          price: actualPrice,
          quantity: actualQuantity,
          proratedTotal: mathRound2(finalPrice),
          effectiveDate: actualEffectiveDate,
          since: nextBillingPeriodFrom,
          from: nextEffectiveDate,
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          subscriptionOrdersTotal,
          description,
          prorationEffectivePrice,
          prorationEffectiveDate,
          subscriptionOrdersSort,
          billableServiceId,
          serviceItemId,
        });
      }
    } else {
      const inCurrentBillingCycle = effectiveDate
        ? compareDateAsc(effectiveDate, nextBillingPeriodFrom) === 1
        : false;

      const startUsageDay = inCurrentBillingCycle ? effectiveDate : nextBillingPeriodFrom;
      const days = Object.keys(serviceDaysOfWeek);
      const usageDay = countCertainDays(days, startUsageDay, nextBillingPeriodTo);
      const daysInBillingCycle = countCertainDays(days, nextBillingPeriodFrom, nextBillingPeriodTo);

      const finalPrice = getFinalPrice(usageDay)(totalPrice, daysInBillingCycle);
      let subscriptionOrdersTotal = 0;

      let subscriptionOrdersSort = [];

      if (subscriptionOrdersInfo && subscriptionOrdersInfo.length) {
        subscriptionOrdersSort = sortSubscriptionOrders({
          subscriptionOrdersInfo,
          nextBillingPeriodTo,
        });
        subscriptionOrdersTotal = subscriptionOrdersSummary({
          subscriptionOrdersInfo,
          nextBillingPeriodTo,
        });
      }

      result.push({
        totalPrice,
        totalDay: daysInBillingCycle,
        usageDay,
        isApplicable: true,
        price,
        quantity,
        proratedTotal: finalPrice ? mathRound2(finalPrice) : 0,
        effectiveDate,
        since: startUsageDay,
        from: nextBillingPeriodTo,
        nextBillingPeriodTo,
        nextBillingPeriodFrom,
        subscriptionOrdersTotal,
        description,
        prorationEffectivePrice,
        prorationEffectiveDate,
        subscriptionOrdersSort,
        billableServiceId,
        serviceItemId,
      });
    }
  }

  return { lineItemsProrationInfo, serviceItemProrationInfo: result };
};

export const serviceItemsTotalAmountCalc = ({
  serviceItems,
  nextBillingPeriodTo,
  nextBillingPeriodFrom,
  anniversaryBilling,
  billingCycle,
}) => {
  const [{ prorationType }] = serviceItems;
  if (prorationType === PRORATION_TYPE.usageDays) {
    return usageDaysCalc({
      serviceItems,
      nextBillingPeriodFrom,
      anniversaryBilling,
      billingCycle,
      nextBillingPeriodTo,
    });
  }

  return servicesPerformedTotalAmount({
    serviceItems,
    nextBillingPeriodFrom,
    anniversaryBilling,
    billingCycle,
    nextBillingPeriodTo,
  });
};

export const aggregateProrationInfo = serviceItemsInfo => {
  const obj = {};

  for (const item of serviceItemsInfo) {
    const { serviceItemId } = item;

    obj[serviceItemId] = obj[serviceItemId] ? obj[serviceItemId].concat(item) : [item];
  }

  return obj;
};

export const summaryBillingPeriod =
  billingPeriodNumber =>
  ({ valuesProrationInfo, taxesTotal }) => {
    let summary = 0;
    for (const proratedItem of Object.values(valuesProrationInfo[billingPeriodNumber])) {
      const sum = proratedItem.reduce((accum, nextItem) => {
        const { proratedTotal, subscriptionOrdersTotal = 0 } = nextItem;
        return accum + proratedTotal + subscriptionOrdersTotal;
      }, 0);

      summary += sum;
    }
    return summary + taxesTotal;
  };
