export const isNumericOrNaN = (value: number | string | undefined | null) =>
  value === null || value === undefined || Number.isNaN(Number(value));
