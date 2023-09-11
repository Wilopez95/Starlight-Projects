import { isPast } from 'date-fns';
import { orderBy } from 'lodash-es';

import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { IServiceItem } from '@root/types';

import { IEffectiveDate } from '../helpers/types';

export const getLatestEffectiveDate = (serviceItem: IServiceItem): Date | null => {
  const effectiveDates: IEffectiveDate[] = serviceItem.lineItems // get updated line items with effective date
    .filter(({ effectiveDate }) => !!effectiveDate)
    .map(({ effectiveDate, updatedAt }) => ({
      effectiveDate,
      updatedAt,
    }));

  if (serviceItem.effectiveDate) {
    // add service effective date to effective dates if service was updated
    effectiveDates.push({
      effectiveDate: serviceItem.effectiveDate,
      updatedAt: serviceItem.updatedAt,
    });
  }

  const sortedEffectiveDates: IEffectiveDate[] = orderBy(effectiveDates, ['updatedAt'], ['desc']); // sort effective dates by date when item was updated
  const latestNotPassedUpdate: IEffectiveDate | undefined = sortedEffectiveDates.find(
    ({ effectiveDate }) => !isPast(substituteLocalTimeZoneInsteadUTC(effectiveDate)),
  );

  return latestNotPassedUpdate // take effective date from the latest not affected update
    ? substituteLocalTimeZoneInsteadUTC(latestNotPassedUpdate.effectiveDate)
    : null;
};
