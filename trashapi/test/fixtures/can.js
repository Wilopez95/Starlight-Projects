import R from 'ramda';
import csv from 'csv';
import Chance from 'chance';
import { format } from 'date-fns';

import { promisify } from '../../src/utils/functions';
import { csvDateFrmt } from '../../src/utils/format';

const chance = new Chance();

const bool = () => chance.integer({ min: 0, max: 1 });

export const toCSV = (cans, adr) =>
  promisify(cb =>
    csv.stringify(
      R.map(
        can => [
          can.id,
          can.serial,
          can.size,
          can.name,
          can.startDate ? format(can.startDate, csvDateFrmt) : null,
          can.source,
          adr ? chance.pickone(adr) : chance.address(),
        ],
        cans,
      ),
      cb,
    ),
  );

export default ({
  name = chance.word(),
  serial = chance.word(),
  size = String(chance.pickone([12, 20, 30, 40])),
  requiresMaintenance = bool(),
  outOfService = bool(),
  deleted = 0,
  source = chance.word(),
  startDate = chance.date({ year: 2015, millisecond: 0 }),
  hazardous = bool(),
} = {}) => ({
  name,
  serial,
  size,
  requiresMaintenance,
  outOfService,
  deleted,
  source,
  startDate,
  hazardous,
});
