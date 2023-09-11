import assert from 'assert';
import { format, addDays } from 'date-fns';
import R from 'ramda';
import mockLocation from '../../fixtures/location';
import {
  clear,
  upAPI,
  toCreate,
  isOdd,
  point,
  rightBbox,
  wrongBbox,
  yesterday,
} from '../../helpers/data';
import { mockDates } from '../common';
import { my } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import cans from '../../../src/tables/cans';
import { cansAgingReportHeader } from '../../../src/routes/reports';

const {
  location: {
    type: { LOCATION, TRUCK, WAYPOINT },
  },
  can: {
    action: { DROPOFF, TRANSFER },
  },
} = constants;

const wasDeleted = 1;

const nearFuture = addDays(10, new Date());

const pickedUpBox = [30.35, 50.31, 30.58, 50.52];

const movedLocationPrefix = 'SRCH-moved-loc';

const mockGens = {
  async search(api, i) {
    const {
      body: { id },
    } = await api.createCan().send({
      name: `SRCH-name-${i}`,
      serial: i === 2 ? `unique-serial` : `SRCH-serial-${i}`,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-${i}-`),
    });
    const newLocNamePrefix = `${movedLocationPrefix}-${i}-`;
    await api.moveCan({ canId: id }).send({
      ...mockLocation(LOCATION, false, newLocNamePrefix),
      location: point(pickedUpBox),
    });
    if (i === 3) {
      await api.pickupCan({ canId: id }).send({
        ...mockLocation(TRUCK, false, newLocNamePrefix),
        location: null,
      });
    }
    if (i === 4) {
      await api.pickupCan({ canId: id }).send({
        ...mockLocation(WAYPOINT, false, newLocNamePrefix),
        location: null,
      });
    }
  },

  async bounds(api, i) {
    const {
      body: { id },
    } = await api.createCan().send({
      location: {
        ...mockLocation(LOCATION, false),
        location: point(rightBbox),
      },
    });
    if (i === 1) {
      await api.moveCan({ canId: id }).send({
        ...mockLocation(LOCATION, false),
        location: point(wrongBbox),
      });
    }
  },
  modifiedSince: mockDates(cans, 'modifiedDate', nearFuture),

  date: mockDates(cans, 'timestamp'),

  async isRequiredMaintenance(_, i) {
    await my(cans.insert({ requiresMaintenance: isOdd(i) ? 0 : 1 }));
  },

  async isOutOfService(_, i) {
    await my(cans.insert({ outOfService: isOdd(i) ? 1 : 0 }));
  },

  async status(_, i) {
    await my(cans.insert({ action: isOdd(i) ? DROPOFF : TRANSFER }));
  },

  async deleted(api, i) {
    const {
      body: { id },
    } = await api.createCan().send({});
    if (i === wasDeleted) {
      await api.deleteCan({ canId: id });
    }
  },

  async size(_, i) {
    await my(cans.insert({ size: isOdd(i) ? 12 : 20 }));
  },

  async name(_, i) {
    await my(cans.insert({ name: `exactName${Number(isOdd(i))}` }));
  },

  async serial(_, i) {
    await my(cans.insert({ serial: `exactSerial${Number(isOdd(i))}` }));
  },
};

const cansToCreate = toCreate(mockGens);

export const before = upAPI(mockGens, cansToCreate);

const cansAgingHeader = R.values(cansAgingReportHeader).join(',');

export const beforeEach = clear;
export const afterEach = clear;

const nullSwap = a => (a ? a : '');

export default {
  [`API-261 cansAgingReport is empty so should
    produce header`]: async request => {
    // Check for records that don't exist.  Verify header.
    const { text } = await request().query().expect('Content-Type', /octet/).expect(200);
    assert.equal(text.trim(), cansAgingHeader);
  },
  [`API-261 cansAgingReport verify that it only 
  returns records before yesterday`]: async (request, api) => {
    // Check for records that don't exist.  Verify header.
    await upAPI(mockGens, cansToCreate)(api);
    const { text: text2 } = await request()
      .query({ beforeDate: yesterday.format('YYYY-MM-DD') })
      .expect('Content-Type', /octet/)
      .expect(200);
    const array = text2.trim().split('\n');
    assert.notEqual(text2.trim(), cansAgingHeader);
    assert.equal(array[0], cansAgingHeader);
    assert.equal(array.length, 5);

    const { text: text3 } = await request()
      .query({ beforeDate: 'bogusdate' })
      .expect('Content-Type', /octet/)
      .expect(200);

    const { text: text4 } = await request()
      .query({ beforeDate: null })
      .expect('Content-Type', /octet/)
      .expect(200);

    const { text: text5 } = await request().query().expect('Content-Type', /octet/).expect(200);
    assert.equal(text3.trim(), text4.trim());
    assert.equal(text4.trim(), text5.trim());

    const { body: listOfCans } = await api.listCans();
    const allCansReport = text3.trim().split('\n');
    assert.equal(allCansReport.length - 1, listOfCans.length);
    const canSearch = can => {
      assert.notEqual(
        R.findIndex(
          R.equals(
            `${nullSwap(can.name)},${nullSwap(can.serial)},${nullSwap(can.size)},` +
              `${nullSwap(can.action)},${format(can.timestamp, 'yyyy-MM-dd')},` +
              `${can.location ? nullSwap(can.location.name) : ''}`,
          ),
          allCansReport,
        ),
        -1,
        `${nullSwap(can.name)},${nullSwap(can.serial)},${nullSwap(can.size)},` +
          `${nullSwap(can.action)},${format(can.timestamp, 'yyyy-MM-dd')},` +
          `${can.location ? nullSwap(can.location.name) : ''} in ${text3}`,
      );
    };
    R.forEach(canSearch, listOfCans);
  },
};
