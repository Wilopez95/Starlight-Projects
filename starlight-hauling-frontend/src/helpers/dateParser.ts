export const parseDate = <T>(value: T): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
    return new Date(value);
  }

  return new Date();
};

export const substituteLocalTimeZoneInsteadUTC = <T>(value: T): Date => {
  const data = parseDate(value);
  const timestampInUTC = data.getTime();
  const offsetInMilliseconds = data.getTimezoneOffset() * 60000;
  const currentTimeStamp = timestampInUTC + offsetInMilliseconds;

  return new Date(currentTimeStamp);
};
