export const baseSort = <T>(value: T): T => {
  if (typeof value === 'undefined' || value === null) {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLocaleLowerCase() as unknown as T;
  }

  return value;
};
