/* eslint-disable no-param-reassign */
import assert from 'assert';
import R, { compose as o } from 'ramda';
import { format, subDays } from 'date-fns';
import { clear } from '../../helpers/data';
import mockWorkOrder, { toCSV } from '../../fixtures/workorder';
import mockLocation from '../../fixtures/location';
import { my } from '../../../src/utils/query';
import { csvDateFrmt } from '../../../src/utils/format';
import { foldP, transformCSV } from '../../../src/utils/functions';
import locations from '../../../src/tables/locations';
import { csvHeader } from '../../../src/routes/workorders/importer';

let fakeOrders;

export const before = async api => {
  const loc1 = mockLocation(
    'LOCATION',
    false,
    '1641 Harden Dr, Barberton, OH 44203, USA',
    'HOME_YARD',
    'Home',
  );
  const loc2 = mockLocation(
    'LOCATION',
    false,
    '300 Redbud Ridge, Onalaska, TX 77360, USA',
    'LANDFILL',
    'Airport',
  );
  const { body: location1 } = await api.createLocation().send(loc1);
  const { body: location2 } = await api.createLocation().send(loc2);

  fakeOrders = await toCSV(
    R.append(
      mockWorkOrder({
        scheduledStart: null,
        scheduledEnd: null,
        location1,
        location2,
      }),
      R.times(
        a =>
          mockWorkOrder({
            scheduledDate: format(subDays(new Date(), a + 1), csvDateFrmt),
          }),
        5,
      ),
    ),
    ['1641 Harden Dr, Barberton, OH 44203, USA', '300 Redbud Ridge, Onalaska, TX 77360, USA'],
  );
  await api.workordersImport().send({ csv: fakeOrders });
  // transform our fake csv to something we suggest the server should send back
  fakeOrders = await transformCSV(
    R.pipeP(
      // fetch formatted name from geocoding service
      foldP(async (acc, record) => {
        const [, , , , , , , , , , seedName1, seedName2] = record;
        const [{ name: name1 }] = await my(locations.select().where({ seedName: seedName1 }));
        const [{ name: name2 }] = await my(locations.select().where({ seedName: seedName2 }));
        record = R.update(10, name1, record);
        record = R.update(11, name2, record);
        return R.append(record, acc);
      }, []),

      // sort by scheduledDate descending
      R.sort(
        R.comparator((a, b) => {
          const aScheduledDate = format(new Date(a[5]), csvDateFrmt);
          const bScheduledDate = format(new Date(b[5]), csvDateFrmt);
          return aScheduledDate.isAfter(bScheduledDate);
        }),
      ),
    ),
    fakeOrders,
  );
};

export const after = clear;

const prepare = o(R.join('\n'), R.map(R.replace(/^\d+,/, ',')), R.split(/\n/));

export default {
  async test(request) {
    fakeOrders = R.join(',', csvHeader) + '\n' + fakeOrders; // R.join(',', csvHeader);
    const { text } = await request().expect('Content-Type', /octet/).expect(200);
    assert.equal(prepare(text).trim(), fakeOrders.trim());
  },
};
