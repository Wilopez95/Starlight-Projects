import { PartialOrNull } from '@root/types';

// map every property in object and if this property equals null or undefined set this property from defaultData
export const notNullObject = <T>(originalObject: PartialOrNull<T>, defaultData: T): T =>
  // @ts-expect-error temporary
  Object.entries(defaultData).reduce((cur, [key]) => {
    // @ts-expect-error temp
    cur[key as keyof T] = originalObject[key as keyof T];

    return cur;
  }, {});
