import omit from 'lodash/fp/omit.js';
import { format } from 'date-fns';

import { getWeekDay } from '../../../../utils/dateTime.js';
import { FREQUENCY_TYPE } from '../../../../consts/frequencyTypes.js';

import { validateTemplate } from './validateTemplate.js';
import { convertDates } from './convertDates.js';
import { defineServicingDays } from './defineServicingDays.js';
import { getPeriod } from './getPeriod.js';

export const getDateFromTemplate = (ctx, { template, today }) => {
  // don't allow auto-generation of one-time order or with invalid frequency
  const serviceDaysOfWeek = template.serviceDaysOfWeek || {};

  const isTempalteValid = validateTemplate(ctx, { template, serviceDaysOfWeek });

  const daysOfWeek = Object.keys(serviceDaysOfWeek).map(dayOfWeek => Number(dayOfWeek));
  ctx.logger.debug(daysOfWeek, 'generateSubsOrders->defineServicingDays->daysOfWeek');

  if (!isTempalteValid) {
    return false;
  }

  const { startDate, initialDate, endDate } = convertDates(ctx, { template, daysOfWeek, today });
  const isMonthly = template.frequencyType === FREQUENCY_TYPE.xPerMonth;

  const { periodStart, periodEnd } = getPeriod({
    startDate,
    endDate,
    initialDate,
    daysOfWeek,
    isMonthly,
  });

  const serviceDays = defineServicingDays(ctx, {
    serviceDaysOfWeek,
    daysOfWeek,
    frequencyType: template.frequencyType,
    frequencyOccurrences: template.frequencyOccurrences,
    subscriptionServiceItemId: template.subscriptionServiceItemId,
    subscriptionId: template.subscriptionId,
    initialDate,
    startDate,
    endDate,
    today,
    periodStart,
    periodEnd,
  });
  ctx.logger.debug(
    serviceDays,
    `
            generateSubsOrders->subscriber->serviceDays
        `,
  );

  const serviceItemInfo = {
    [template.subscriptionServiceItemId]: {
      subscriptionId: template.subscriptionId,
      subscriptionServiceItemId: template.subscriptionServiceItemId,
      billableServiceId: template.billableServiceId,
      servicingDaysRoutes: serviceDays.servicingDaysRoutes,
    },
  };

  return {
    subOrdersData: serviceDays.servicingDays.map(servicingDay => ({
      ...omit([
        'startDate',
        'endDate',
        'serviceDaysOfWeek',
        'frequencyType',
        'frequencyOccurrences',
        'deliveryDate',
        'finalDate',
      ])(template),
      serviceDate: format(servicingDay, 'yyyy-MM-dd HH:mm:ss'),
      serviceDayOfWeekRequiredByCustomer:
        serviceDays.servicingDaysRequiredByCustomer[getWeekDay(servicingDay)],
    })),
    serviceItemInfo,
  };
};
