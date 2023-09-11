import {
  max as maxDate,
  min as minDate,
  startOfDay,
  endOfDay,
  subDays,
  isWithinInterval,
  isSameDay,
} from 'date-fns';

const getProrationPeriods = ({
  billingPeriods = [],
  effectiveDates = [],
  subscriptionStartDate,
  subscriptionEndDate,
}) =>
  billingPeriods.map(({ nextBillingPeriodFrom, nextBillingPeriodTo }) => {
    const usageStartDay = maxDate([nextBillingPeriodFrom, subscriptionStartDate]);
    const usageEndDay = subscriptionEndDate
      ? minDate([nextBillingPeriodTo, subscriptionEndDate])
      : nextBillingPeriodTo;

    const applicableEffectiveDates = effectiveDates.filter(effectiveDate =>
      isWithinInterval(effectiveDate, {
        start: usageStartDay,
        end: usageEndDay,
      }),
    );

    const prorationPeriods = [];
    if (!isSameDay(usageStartDay, usageEndDay) && applicableEffectiveDates.length) {
      applicableEffectiveDates.forEach((applicableEffectiveDate, idx) => {
        if (!isSameDay(usageStartDay, applicableEffectiveDate)) {
          prorationPeriods.push({
            periodFrom: idx === 0 ? usageStartDay : startOfDay(applicableEffectiveDates[idx - 1]),
            periodTo: endOfDay(subDays(applicableEffectiveDate, 1)),
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }

        const lastIdx = applicableEffectiveDates.length - 1;
        if (idx === lastIdx) {
          prorationPeriods.push({
            periodFrom: startOfDay(applicableEffectiveDates[lastIdx]),
            periodTo: usageEndDay,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
          });
        }
      });
    } else {
      prorationPeriods.push({
        periodFrom: usageStartDay,
        periodTo: usageEndDay,
        nextBillingPeriodFrom,
        nextBillingPeriodTo,
      });
    }

    return prorationPeriods;
  });

export default getProrationPeriods;
