import { IEntity } from '../types/entity';
import { JsonConversions } from '../types/JsonConversions';

export const parseDate = <T>(value: T): Date => {
  if (value instanceof Date) {
    return value;
  } else if (typeof value === 'string') {
    return new Date(value);
  }

  return new Date();
};

type ResolvedEntity<T> = T extends JsonConversions<infer E>
  ? Exclude<T, JsonConversions<unknown>> | E
  : T;

export const convertDates = <
  T extends JsonConversions<Omit<IEntity, 'id'>> | undefined | null,
>(
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
