import { PartialOrNull } from '@root/types';

// map every property in object and if this property equals null or undefined set this property from defaultData
export const notNullObject = <T>(originalObject: PartialOrNull<T>, defaultData: T): T =>
  // @ts-expect-error temporary
  Object.entries(defaultData).reduce<T>((cur, [key, value]) => {
    // @ts-expect-error temporary
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    cur[key as keyof T] = originalObject ? originalObject[key as keyof T] : value;

    return cur;
    // @ts-expect-error temporary
  }, {});
