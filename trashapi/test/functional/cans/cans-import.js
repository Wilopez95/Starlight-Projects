import R from 'ramda';
import { set, addDays } from 'date-fns';
import mockCan, { toCSV } from '../../fixtures/can';
import importCase from '../common/import';
import cans from '../../../src/tables/cans';
import { csvHeader } from '../../../src/routes/cans';

export const { beforeEach, afterEach, def } = importCase({
  toCSV,
  csvHeader,

  table: cans,

  fix: R.set(R.lensProp('source'), 'one source'),

  genListOfEntities: (length = 5) =>
    R.times(
      i =>
        mockCan({
          startDate:
            i === 1
              ? null
              : set(new Date(2015, 3, 10), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })(
                  addDays(new Date(2015, 3, 10), i),
                ),
        }),
      length,
    ),
});

export default def;
