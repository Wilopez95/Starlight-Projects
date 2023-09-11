import { PartialOrNull } from '@root/core/types';

// map every property in object and if this property equals null or undefined set this property from defaultData
export const notNullObject = <T>(originalObject: PartialOrNull<T>, defaultData: T): T => {
  return Object.entries(defaultData).reduce<T>((cur, [key, value]) => {
    cur[key as keyof T] = originalObject[key as keyof T] ?? value;

    return cur;
  }, {} as T);
};
