import { IEntity } from '@root/types';
import { JsonConversions } from '@root/types/helpers/JsonConversions';

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
