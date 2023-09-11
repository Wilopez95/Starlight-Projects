// required due to changes of timezone on last Sunday of October and last Sunday of March:
import { ensureUtc } from './ensureUtc.js';
import sortByDateValueDesc from './sortByDateValueDesc.js';

export const getFirstServicingDate = (choices, delivery) => {
  const [firstServicingDate] = choices
    .filter(i => i.valueOf() >= delivery.valueOf())
    .sort(sortByDateValueDesc);
  ensureUtc(firstServicingDate);
  return firstServicingDate;
};
