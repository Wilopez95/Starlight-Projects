import { format } from 'date-fns';

import { DateFormat } from '@root/consts';
import { IEntity, JsonConversions } from '@root/types';

import { parseDate } from './dateParser';

type ResolvedEntity<T> = T extends JsonConversions<infer E>
  ? Exclude<T, JsonConversions<unknown>> | E
  : T;

export const convertDates = <T extends JsonConversions<Omit<IEntity, 'id'>> | undefined | null>(
  entity: T,
): ResolvedEntity<T> => {
  const newEntity = entity as ResolvedEntity<T>;

  if (!newEntity) {
    return newEntity;
  }

  newEntity.createdAt = parseDate(newEntity.createdAt);
  newEntity.updatedAt = parseDate(newEntity.updatedAt);

  return newEntity;
};

export const formatServiceDate = (serviceDate: Date) =>
  format(new Date(serviceDate), DateFormat.DateSerialized);

//TODO: remove and rewrite convertDates function when all timestamps come as number from backend
export const convertTimeStamps = <
  T extends JsonConversions<Omit<IEntity, 'id'>> | undefined | null,
>(
  entity: T,
): ResolvedEntity<T> => {
  const newEntity = entity as ResolvedEntity<T>;

  if (!newEntity) {
    return newEntity;
  }

  newEntity.createdAt = new Date(+newEntity.createdAt);
  newEntity.updatedAt = new Date(+newEntity.updatedAt);

  return newEntity;
};
