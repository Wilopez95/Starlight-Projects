export const parseDate = <T>(value: T): Date => {
  if (value instanceof Date) {
    return value;
  } else if (typeof value === 'string') {
    return new Date(value);
  }

  return new Date();
};
