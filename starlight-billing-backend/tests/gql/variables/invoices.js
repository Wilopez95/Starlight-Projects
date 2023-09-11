// fragment invoice on Invoice
import { addWeeks, endOfDay, startOfDay } from 'date-fns';

export const range = {
  from: addWeeks(new Date(), -2),
  to: new Date(),
};
export const offset = 0;
export const limit = 25;
export const sortBy = 'ID';
export const sortOrder = 'asc';
export const onlyOpen = false;

export const getAllInput = {
  limit,
  offset,
  sortBy,
  sortOrder: sortOrder.toUpperCase(),
  from: startOfDay(range.from).toUTCString(),
  to: endOfDay(range.to).toUTCString(),
  openOnly: onlyOpen,
};
