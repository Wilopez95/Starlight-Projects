// required due to changes of timezone on last Sunday of October and last Sunday of March:
export const ensureUtc = date => {
  const tzOffset = -Math.round(date.getTimezoneOffset() / 60);
  date.setHours(tzOffset);
  return date;
};
