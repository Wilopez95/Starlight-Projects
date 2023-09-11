import R from 'ramda';
import { addDays, set } from 'date-fns';
import mockWorkOrder, { toCSV } from '../../fixtures/workorder';
import importCase from '../common/import';
import workorders from '../../../src/tables/workorders';
import { csvHeader } from '../../../src/routes/workorders/importer';

export const { beforeEach, afterEach, def } = importCase({
  toCSV,
  csvHeader,

  table: workorders,

  fix: R.set(R.lensProp('material'), 'one material'),

  locs: 2,

  genListOfEntities: (length = 5) =>
    R.times(
      i =>
        mockWorkOrder({
          size: '40',
          scheduledDate:
            i === 1
              ? null
              : i === 1
              ? null
              : set(new Date(2015, 3, 10), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })(
                  addDays(new Date(2015, 3, 10), i),
                ),
        }),
      length,
    ),
});

export default def;
