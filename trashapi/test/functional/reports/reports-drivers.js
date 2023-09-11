import assert from 'assert';
import R, { compose as o } from 'ramda';
import reportView from '../../../src/views/reports';
import {
  byDayReportHeader,
  byDateRangeReportHeader,
} from '../../../src/routes/reports';

const byDayHeader = R.values(byDayReportHeader).join(',');
const byDateRangeHeader = R.values(byDateRangeReportHeader).join(',');

const mockData = {
  id: '50',
  name: 'Rich Howell Rt15',
  reportDay: '2017-05-26T00:00:00.000Z',
  woCount: '13',
  timecards: '1',
  incomplete: '0',
  preTrip: '2017-05-26 08:18:00.895',
  miles: '550918',
  startTime: '2017-05-26T08:17:40.000Z',
  stopTime: '2017-05-26T22:40:18.000Z',
  adjustedTime: 51758,
};

const reportData = {
  id: '50',
  name: 'Rich Howell Rt15',
  reportDay: '2017-05-26T00:00:00.000Z',
  woCount: '13',
  timecards: '1',
  incomplete: '0',
  preTrip: '8:18:00 AM',
  miles: '550918',
  startTime: '8:17:40 AM',
  stopTime: '10:40:18 PM',
  time: '14:22',
  workTime: '14:22',
  preTripDuration: '00:00',
  date: '2017-05-26',
  hoursPerWO: '01:06',
  milesPerWO: '42378.31',
};

const prepare = o(R.join('\n'), R.map(R.replace(/^\d+,/, ',')), R.split(/\n/));

export default {
  [`API-205 byDay report should have correct header`]: async request => {
    const { text } = await request()
      .query({
        date: '1495756800000..1495929599000',
        reportType: 'byDay',
        driverId: '32,33,41',
        status: 'COMPLETED,INPROGRESS',
        action: 'FINAL,SWITCH',
      })
      .expect('Content-Type', /octet/)
      .expect(200);
    assert.equal(prepare(text).trim(), byDayHeader.trim());
  },
  [`API-205 byDateRange report should have correct header`]: async request => {
    const { text } = await request()
      .query({ reportType: 'byDateRange', material: 'Asphalt,Wood Recycle' })
      .expect('Content-Type', /octet/)
      .expect(200);
    assert.equal(text.trim(), byDateRangeHeader.trim());
  },
  [`API-205 should return empty response`]: async request => {
    const { text } = await request()
      .query({ reportType: 'incorrectType' })
      .expect(200);
    assert.equal(text.trim(), '');
  },
  [`API-205 driversReportView should return report data`]: async () => {
    assert.deepEqual(reportView(mockData), reportData);
    const mock = {
      date: '',
      hoursPerWO: '00:00',
      milesPerWO: null,
      preTrip: '',
      preTripDuration: '?',
      startTime: '',
      stopTime: '',
      time: '?',
      workTime: '?',
    };
    assert.deepEqual(reportView({}), mock);
  },
};
