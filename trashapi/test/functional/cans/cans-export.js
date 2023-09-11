import assert from 'assert';
import R, { compose as o } from 'ramda';

import { clear } from '../../helpers/data';
import { my } from '../../../src/utils/query';
import { foldP, transformCSV } from '../../../src/utils/functions';
import locations from '../../../src/tables/locations';
import { csvHeader } from '../../../src/routes/cans';

let fakeCans;
const truck = 'some TRUCK';

export const before = async api => {
  await api.createLocation().send({ name: truck, type: 'TRUCK' });
  fakeCans = [
    ',,40,can1,1/25/2017,src1,' + truck,
    ',,30,can2,1/25/2017,src2,"ul. Lenina, 23, Omsk"',
    ',,40,can3,1/25/2017,src3,',
  ].join('\n');

  await api.cansImport().send({ csv: fakeCans });

  fakeCans = await transformCSV(
    foldP(async (acc, record) => {
      const [, , , , , , seedName] = record;
      const locatios = await my(locations.select().where({ seedName }));
      const name = (locatios[0] && locatios[0].name) || '';
      return R.append(R.update(6, name, record), acc);
    }, []),
    fakeCans,
  );
};

export const after = clear;

const prepare = o(R.join('\n'), R.map(R.replace(/^\d+,/, ',')), R.split(/\n/));

export default {
  async test(request) {
    fakeCans = R.join(',', csvHeader) + '\n' + fakeCans;
    const { text } = await request()
      .expect('Content-Type', /octet/)
      .expect(200);
    assert.equal(prepare(text).trim(), fakeCans.replace(truck, '').trim());
  },
};
