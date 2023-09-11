import { convertDates, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { IFrequency, JsonConversions } from '@root/types';

export const sanitizeFrequencies = (frequencies: IFrequency[]) =>
  frequencies.map(frequency => {
    const effectiveDate = frequency.effectiveDate
      ? substituteLocalTimeZoneInsteadUTC(frequency.effectiveDate)
      : null;

    return {
      ...frequency,
      effectiveDate,
      times: !frequency.times ? undefined : frequency.times,
    };
  });

export const convertFrequencies = (entity: JsonConversions<IFrequency>): IFrequency => {
  if (!entity) {
    return entity;
  }

  const parsedEntity = convertDates(entity);

  return parsedEntity;
};
